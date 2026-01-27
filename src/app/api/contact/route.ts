import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Resend } from 'resend';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

// Initialiser Resend seulement quand on en a besoin
const getResendClient = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    return new Resend(apiKey);
};

export async function POST(request: NextRequest) {
    try {
        // Vérifier l'authentification
        const session = await auth.api.getSession({ headers: request.headers });
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { firstName, lastName, entreprise, email, phone, motif, message, selectedAddress, manualAddress, manualPostalCode, manualCity, eventDate, numberOfGuests, budgetPerPerson, cartItems, cartTotal, restaurantName, kitchenStaff } = body;

        // Validation des champs obligatoires
        if (!firstName || !lastName || !email || !motif || !message) {
            return NextResponse.json(
                { error: 'Tous les champs requis doivent être remplis' },
                { status: 400 }
            );
        }

        // Récupérer le type d'utilisateur depuis la base de données
        const user = db.prepare('SELECT type FROM user WHERE id = ?').get(session.user.id) as { type: string } | undefined;
        
        // Validation pour les entreprises
        if (user?.type === 'entreprise' && !entreprise) {
            return NextResponse.json(
                { error: 'Le champ entreprise est obligatoire pour les comptes professionnels' },
                { status: 400 }
            );
        }

        // Validation de l'adresse si requise
        const requiresAddress = motif === 'commande' || motif === 'collaboration-entreprise' || motif === 'collaboration-particulier' || motif === 'prestation-domicile' || motif === 'consulting';
        if (requiresAddress && !selectedAddress && (!manualAddress || !manualPostalCode || !manualCity)) {
            return NextResponse.json(
                { error: 'Une adresse est requise pour ce type de demande' },
                { status: 400 }
            );
        }

        // Validation pour les collaborations
        const isCollaboration = motif === 'collaboration-entreprise' || motif === 'collaboration-particulier';
        if (isCollaboration) {
            if (!eventDate) {
                return NextResponse.json(
                    { error: 'La date de l\'événement est obligatoire' },
                    { status: 400 }
                );
            }
            if (!numberOfGuests || parseInt(numberOfGuests) <= 0) {
                return NextResponse.json(
                    { error: 'Le nombre d\'invités est obligatoire' },
                    { status: 400 }
                );
            }
            if (!budgetPerPerson || parseFloat(budgetPerPerson) <= 0) {
                return NextResponse.json(
                    { error: 'Le budget par personne est obligatoire' },
                    { status: 400 }
                );
            }
        }

        if (message.trim().length < 10) {
            return NextResponse.json(
                { error: 'Le message doit contenir au moins 10 caractères' },
                { status: 400 }
            );
        }

        // Sauvegarder le message en base de données
        const messageId = randomUUID();
        const now = new Date().toISOString();
        
        db.prepare(`
            INSERT INTO contact_messages (
                id, userId, firstName, lastName, email, phone, entreprise, 
                motif, message, status, createdAt, updatedAt,
                manualAddress, manualPostalCode, manualCity, selectedAddress
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)
        `).run(
            messageId,
            session.user.id,
            firstName,
            lastName,
            email,
            phone || null,
            entreprise || null,
            motif,
            message,
            now,
            now,
            manualAddress || null,
            manualPostalCode || null,
            manualCity || null,
            selectedAddress || null
        );

        // Créer une commande pour TOUS les motifs (pas seulement 'commande')
        const orderId = `ORD-${Date.now().toString().slice(-6)}`;
        const initialHistory = [{
            status: 'pending_confirmation',
            date: now,
            label: 'En attente'
        }];

        // Déterminer le type et le total
        let orderType = 'service'; // Par défaut, c'est une prestation de service
        let orderTotal = 0;
        let orderItems: any[] = [];

        if (motif === 'commande' && cartItems && cartItems.length > 0) {
            orderType = 'product';
            orderTotal = cartTotal || 0; // Les prix sont déjà en euros
            orderItems = cartItems;
        } else {
            // Pour les services, on peut calculer un total estimé basé sur le budget
            if (budgetPerPerson && numberOfGuests) {
                orderTotal = parseFloat(budgetPerPerson) * parseInt(numberOfGuests);
            }
        }

        // Créer l'entrée dans la table orders
        db.prepare(`
            INSERT INTO orders (
                id, userId, type, status, total, items, serviceType, history, createdAt, updatedAt
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            orderId,
            session.user.id,
            orderType,
            'pending_confirmation',
            orderTotal,
            JSON.stringify(orderItems),
            motif,
            JSON.stringify(initialHistory),
            now,
            now
        );
        
        console.log(`[API] Commande créée: ${orderId} (type: ${orderType}, motif: ${motif})`);

        // Récupérer tous les emails des administrateurs
        const admins = db.prepare('SELECT email FROM user WHERE type = ?').all('administrateur') as { email: string }[];
        const adminEmails = admins.map(admin => admin.email);

        // Envoyer l'email aux administrateurs si au moins un admin existe
        const resend = getResendClient();
        if (resend && adminEmails.length > 0) {
            try {
                // Construire le lien vers la page de détails de la commande
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
                const orderDetailsUrl = `${baseUrl}/admin/commandes/${orderId}`;
                
                // Récupérer l'adresse si sélectionnée
                let addressDetails = '';
                if (selectedAddress) {
                    const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(selectedAddress) as any;
                    if (address) {
                        addressDetails = `
                            <div class="field-group">
                                <div class="field-label">Adresse sélectionnée</div>
                                <p class="field-value">
                                    ${address.name}<br>
                                    ${address.address}<br>
                                    ${address.postalCode} ${address.city}
                                </p>
                            </div>
                        `;
                    }
                }
                
                // Template d'email formaté
                const emailHtml = `
                    <!DOCTYPE html>
                    <html lang="fr">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { 
                                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                                line-height: 1.5; 
                                color: #111; 
                                margin: 0;
                                padding: 0;
                                background-color: #f5f5f5;
                            }
                            .wrapper {
                                width: 100%;
                                background-color: #f5f5f5;
                                padding: 40px 0;
                            }
                            .container {
                                background-color: #ffffff;
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 40px;
                                text-align: center;
                                border-radius: 8px; /* Slightly easier on the eyes */
                                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                            }
                            h1 { 
                                font-size: 20px;
                                font-weight: 300;
                                text-transform: uppercase;
                                letter-spacing: 2px;
                                margin: 0 0 10px 0;
                                color: #111;
                            }
                            .motif {
                                font-size: 14px;
                                color: #666;
                                margin-bottom: 30px;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                            }
                            .divider {
                                height: 1px;
                                background-color: #eee;
                                width: 100px;
                                margin: 20px auto;
                                border: none;
                            }
                            .section {
                                margin-bottom: 20px;
                            }
                            .enterprise {
                                font-size: 18px;
                                font-weight: 600;
                                color: #000;
                                margin-bottom: 5px;
                            }
                            .name {
                                font-size: 24px;
                                font-weight: 400;
                                color: #000;
                                margin-bottom: 5px;
                            }
                            .contact-info {
                                font-size: 14px;
                                color: #555;
                            }
                            .contact-info span {
                                margin: 0 10px;
                            }
                            .details-grid {
                                display: table;
                                width: 100%;
                                margin-top: 30px;
                                margin-bottom: 30px;
                                text-align: left; /* Reset alignment for this section */
                                border-top: 1px solid #eee;
                                border-bottom: 1px solid #eee;
                            }
                            .details-column {
                                display: table-cell;
                                width: 50%;
                                padding: 20px;
                                vertical-align: top;
                            }
                            .details-title {
                                font-size: 11px;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                                font-weight: 700;
                                color: #999;
                                margin-bottom: 10px;
                                display: block;
                            }
                            .address-text, .cart-list {
                                font-size: 13px;
                                color: #333;
                                line-height: 1.6;
                            }
                            .cart-item {
                                margin-bottom: 8px;
                                display: block;
                            }
                            .cart-total {
                                margin-top: 10px;
                                font-weight: 600;
                                border-top: 1px solid #eee;
                                padding-top: 5px;
                                display: block;
                            }
                            .message-box {
                                text-align: left;
                                background-color: #fafafa;
                                padding: 20px;
                                margin-top: 20px;
                                border-radius: 4px;
                                white-space: pre-wrap;
                                font-size: 14px;
                                color: #444;
                            }
                            .button {
                                display: inline-block;
                                padding: 12px 30px;
                                border: 1px solid #111;
                                background-color: #111;
                                color: #ffffff !important;
                                text-decoration: none;
                                font-size: 12px;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                                margin-top: 40px;
                                transition: all 0.2s;
                            }
                            .button:hover {
                                background-color: #fff;
                                color: #111 !important;
                            }
                            .footer {
                                margin-top: 30px;
                                font-size: 11px;
                                color: #aaa;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="wrapper">
                            <div class="container">
                                <h1>Nouvelle Demande</h1>
                                <div class="motif">${getMotifLabel(motif)}</div>

                                <hr class="divider">

                                <!-- Ligne 1: Entreprise -->
                                ${entreprise ? `<div class="enterprise">${entreprise}</div>` : ''}

                                <!-- Ligne 2: Nom et Prénom -->
                                <div class="name">${firstName} ${lastName}</div>

                                <!-- Ligne 3: Mail et Téléphone -->
                                <div class="contact-info">
                                    <a href="mailto:${email}" style="color: #555; text-decoration: none;">${email}</a>
                                    ${phone ? `<span>|</span> <a href="tel:${phone}" style="color: #555; text-decoration: none;">${phone}</a>` : ''}
                                </div>

                                <!-- Ligne 4: Récapitulatif et Adresse (Side by Side) -->
                                ${(cartItems && cartItems.length > 0) || selectedAddress || manualAddress ? `
                                    <div class="details-grid">
                                        <!-- Colonne Gauche: Panier -->
                                        ${cartItems && cartItems.length > 0 ? `
                                            <div class="details-column" style="border-right: 1px solid #eee;">
                                                <span class="details-title">Votre Sélection</span>
                                                <div class="cart-list">
                                                    ${cartItems.map((item: any) => `
                                                        <span class="cart-item">
                                                            <strong>${item.name}</strong><br>
                                                            <span style="color: #666;">${item.quantity} x ${item.price.toFixed(2)}€</span>
                                                        </span>
                                                    `).join('')}
                                                    ${cartTotal ? `<span class="cart-total">Total: ${cartTotal.toFixed(2)} €</span>` : ''}
                                                </div>
                                            </div>
                                        ` : '<div class="details-column"></div>'}

                                        <!-- Colonne Droite: Adresse -->
                                        <div class="details-column">
                                            <span class="details-title">Lieu de réception</span>
                                            <div class="address-text">
                                                ${selectedAddress ? (() => {
                                                    const addr = db.prepare('SELECT * FROM addresses WHERE id = ?').get(selectedAddress) as any;
                                                    return addr ? `${addr.name}<br>${addr.address}<br>${addr.postalCode} ${addr.city}` : 'Adresse introuvable';
                                                })() : ''}
                                                ${manualAddress ? `
                                                    ${restaurantName ? `<strong>${restaurantName}</strong><br>` : ''}
                                                    ${manualAddress}<br>
                                                    ${manualPostalCode} ${manualCity}
                                                    ${kitchenStaff ? `<br><br><em>Staff cuisine: ${kitchenStaff}</em>` : ''}
                                                ` : ''}
                                                
                                                ${(motif === 'collaboration-entreprise' || motif === 'collaboration-particulier') ? `
                                                    <br><br>
                                                    <strong>Date:</strong> ${eventDate || 'Non spécifiée'}<br>
                                                    <strong>Invités:</strong> ${numberOfGuests || '-'}<br>
                                                    <strong>Budget:</strong> ${budgetPerPerson || '-'} €/pers
                                                ` : ''}
                                            </div>
                                        </div>
                                    </div>
                                ` : ''}

                                <!-- Ligne 5: Message -->
                                <div class="section" style="margin-bottom: 0;">
                                    <span class="details-title" style="text-align: center;">Message du client</span>
                                    <div class="message-box">${message}</div>
                                </div>

                                <!-- Bouton Action -->
                                <a href="${orderDetailsUrl}" class="button">Accéder à la commande</a>

                                <!-- Footer -->
                                <div class="footer">
                                    ID: ${orderId} &bull; ${new Date(now).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                `;

                const { data, error } = await resend.emails.send({
                    from: "Traiteur <contact@delarys.com>",
                    to: adminEmails,
                    replyTo: email,
                    subject: `Formulaire - ${getMotifLabel(motif)}`,
                    html: emailHtml,
                });

                if (error) {
                    console.error('[API] Erreur Resend:', error);
                    // Ne pas bloquer l'envoi si l'email échoue
                } else {
                    console.log(`[API] Email envoyé avec succès à ${adminEmails.length} administrateur(s) !`, data);
                }
            } catch (emailError) {
                console.error('[API] Erreur lors de l\'envoi de l\'email:', emailError);
                // Ne pas bloquer l'envoi si l'email échoue
            }
        } else if (adminEmails.length === 0) {
            console.warn('[API] Aucun administrateur trouvé pour l\'envoi de l\'email');
        }

        // --- ENVOI DE L'EMAIL DE CONFIRMATION AU CLIENT ---
        if (resend) {
            try {
                const baseURL = process.env.NEXT_PUBLIC_APP_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || 
                    "http://localhost:3000";
                
                // Utiliser une URL d'image valide accessible publiquement
                const logoURL = `https://utfs.io/f/8a4b0c5e-3043-4a3b-a526-267d09cf7ea3-logo.png`; // Fallback ou URL réelle si disponible, sinon utiliser texte
                // Note: Pour cet exemple, on reprend le style d'auth.ts mais on s'assure que le logo est accessible.
                // Si pas de logo externe stable, on peut utiliser le texte stylisé.

                let clientSubject = "Confirmation de votre demande - Athéna Event";
                let clientTitle = "Nous avons bien reçu votre demande";
                let clientMessage = "";
                let clientSubMessage = "Nous reviendrons vers vous dans les plus brefs délais.";

                // Personnalisation du message selon le motif
                switch (motif) {
                    case 'commande':
                        clientSubject = "Votre commande est en de bonnes mains";
                        clientTitle = "L'Art de recevoir commence ici";
                        clientMessage = `Cher(e) ${firstName} ${lastName},<br><br>Votre commande a bien été enregistrée. Nos chefs et nos équipes s'attellent déjà à imaginer la mise en scène de vos envies culinaires.`;
                        clientSubMessage = "Vous recevrez prochainement une confirmation détaillée de la validation de votre commande.";
                        break;
                    case 'collaboration-entreprise':
                    case 'collaboration-particulier':
                        clientSubject = "Merci de votre confiance";
                        clientTitle = "Tissons des liens d'exception";
                        clientMessage = `Cher(e) ${firstName} ${lastName},<br><br>Nous sommes honorés de votre intérêt pour une collaboration. Chaque projet est une nouvelle page blanche que nous avons hâte d'écrire avec vous.`;
                        clientSubMessage = "Notre équipe dédiée va étudier votre proposition et vous contactera très rapidement.";
                        break;
                    case 'prestation-domicile':
                    case 'consulting':
                        clientSubject = "Votre projet, notre expertise";
                        clientTitle = "L'Excellence s'invite chez vous";
                        clientMessage = `Cher(e) ${firstName} ${lastName},<br><br>Merci de nous confier vos projets. Nous mettrons tout en œuvre pour transformer votre vision en une réalité inoubliable.`;
                        break;
                    default: // 'autre' et cas par défaut
                        clientSubject = "Nous avons bien reçu votre message";
                        clientTitle = "À votre écoute";
                        clientMessage = `Cher(e) ${firstName} ${lastName},<br><br>Merci de nous avoir contactés. Votre message a retenu toute notre attention.`;
                        break;
                }

                const clientEmailHtml = `
                    <!DOCTYPE html>
                    <html lang="fr">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { font-family: 'Times New Roman', Times, serif; background-color: #ffffff; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
                            .wrapper { width: 100%; table-layout: fixed; background-color: #ffffff; padding-bottom: 40px; }
                            .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #1a1a1a; }
                            .content { padding: 40px 20px; text-align: center; }
                            .logo-text { font-family: 'Times New Roman', Times, serif; font-size: 24px; letter-spacing: 3px; text-transform: uppercase; padding: 40px 0; display: block; color: #000; text-decoration: none; }
                            h1 { font-family: 'Times New Roman', Times, serif; font-size: 22px; font-weight: 400; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 30px; color: #1a1a1a; }
                            p { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.8; color: #444444; margin-bottom: 20px; }
                            .footer { padding: 40px 20px; text-align: center; font-family: Arial, sans-serif; font-size: 11px; color: #999999; border-top: 1px solid #eeeeee; }
                            .button { background-color: #111; color: #fff !important; padding: 12px 25px; text-decoration: none; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; display: inline-block; margin-top: 20px; }
                        </style>
                    </head>
                    <body>
                        <center class="wrapper">
                            <table class="main">
                                <tr>
                                    <td style="text-align: center;">
                                        <div class="logo-text">ATHÉNA EVENT</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="content">
                                        <h1>${clientTitle}</h1>
                                        <p>${clientMessage}</p>
                                        <p>${clientSubMessage}</p>
                                        
                                        ${motif === 'commande' ? `
                                            <a href="${baseURL}/compte" class="button">Suivre ma commande</a>
                                        ` : ''}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="content">
                                        <p style="font-style: italic; font-family: 'Times New Roman', Times, serif; font-size: 16px;">"Le luxe, c'est la simplicité."</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="footer">
                                        ATHÉNA EVENT PARIS<br>
                                        Traiteur de Haute Gastronomie – Paris<br>
                                        <a href="${baseURL}" style="color: #999; text-decoration: none;">www.athena-event.com</a>
                                    </td>
                                </tr>
                            </table>
                        </center>
                    </body>
                    </html>
                `;

                await resend.emails.send({
                    from: "Traiteur <contact@delarys.com>",
                    to: [email],
                    subject: clientSubject,
                    html: clientEmailHtml,
                });
                console.log(`[API] Email de confirmation client envoyé à ${email}`);
            } catch (clientEmailError) {
                console.error('[API] Erreur envoi email client:', clientEmailError);
                // On ne bloque pas la réponse si l'email client échoue
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Message envoyé avec succès'
        });
    } catch (error: any) {
        console.error('[API] Erreur contact:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de l\'envoi du message' },
            { status: 500 }
        );
    }
}

function getMotifLabel(motif: string): string {
    const labels: { [key: string]: string } = {
        'commande': 'Commande / Devis',
        'collaboration-entreprise': 'Collaboration - Entreprise',
        'collaboration-particulier': 'Collaboration - Particulier',
        'prestation-domicile': 'Prestation à domicile',
        'consulting': 'Consulting',
        'autre': 'Autre (renseignements, etc.)'
    };
    return labels[motif] || motif;
}
