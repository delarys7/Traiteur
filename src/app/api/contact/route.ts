import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Resend } from 'resend';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

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
                motif, message, status, createdAt, updatedAt
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
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
            now
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
        if (process.env.RESEND_API_KEY && adminEmails.length > 0) {
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
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                                line-height: 1.6; 
                                color: #333; 
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                                background-color: #f5f5f5;
                            }
                            .container {
                                background-color: #ffffff;
                                border-radius: 8px;
                                padding: 30px;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            }
                            h1 { 
                                color: #111; 
                                font-size: 24px;
                                margin-bottom: 10px;
                                border-bottom: 2px solid #111;
                                padding-bottom: 10px;
                            }
                            h2 { 
                                color: #111; 
                                font-size: 18px;
                                margin-top: 25px;
                                margin-bottom: 15px;
                                font-weight: 600;
                            }
                            .field-group {
                                margin-bottom: 20px;
                                padding: 15px;
                                background-color: #f9f9f9;
                                border-radius: 4px;
                                border-left: 3px solid #111;
                            }
                            .field-label {
                                font-weight: 600;
                                color: #666;
                                font-size: 12px;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 5px;
                            }
                            .field-value {
                                color: #111;
                                font-size: 14px;
                                margin: 0;
                            }
                            .button {
                                display: inline-block;
                                padding: 12px 24px;
                                background-color: #111;
                                color: #ffffff;
                                text-decoration: none;
                                border-radius: 4px;
                                margin-top: 20px;
                                font-weight: 600;
                                text-align: center;
                            }
                            .button:hover {
                                background-color: #333;
                            }
                            ul {
                                margin: 10px 0;
                                padding-left: 20px;
                            }
                            li {
                                margin: 5px 0;
                            }
                            .footer {
                                margin-top: 30px;
                                padding-top: 20px;
                                border-top: 1px solid #eee;
                                font-size: 12px;
                                color: #999;
                                text-align: center;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Nouveau Formulaire de Contact</h1>
                            
                            <div class="field-group">
                                <div class="field-label">Motif</div>
                                <p class="field-value">${getMotifLabel(motif)}</p>
                            </div>

                            ${entreprise ? `
                            <div class="field-group">
                                <div class="field-label">Entreprise</div>
                                <p class="field-value">${entreprise}</p>
                            </div>
                            ` : ''}

                            <div class="field-group">
                                <div class="field-label">Prénom</div>
                                <p class="field-value">${firstName}</p>
                            </div>

                            <div class="field-group">
                                <div class="field-label">Nom</div>
                                <p class="field-value">${lastName}</p>
                            </div>

                            <div class="field-group">
                                <div class="field-label">Email</div>
                                <p class="field-value">${email}</p>
                            </div>

                            ${phone ? `
                            <div class="field-group">
                                <div class="field-label">Téléphone</div>
                                <p class="field-value">${phone}</p>
                            </div>
                            ` : ''}

                            ${(selectedAddress || manualAddress) ? `
                            <h2>Adresse de l'événement / livraison</h2>
                            ${addressDetails}
                            ${manualAddress ? `
                                <div class="field-group">
                                    <div class="field-label">Adresse saisie manuellement</div>
                                    <p class="field-value">
                                        ${restaurantName ? `<strong>Nom du restaurant:</strong> ${restaurantName}<br>` : ''}
                                        ${manualAddress}<br>
                                        ${manualPostalCode} ${manualCity}
                                        ${kitchenStaff ? `<br><strong>Employés en cuisine:</strong> ${kitchenStaff}` : ''}
                                    </p>
                                </div>
                            ` : ''}
                            ` : ''}

                            ${(motif === 'collaboration-entreprise' || motif === 'collaboration-particulier') ? `
                            <h2>Détails de l'événement</h2>
                            ${eventDate ? `
                            <div class="field-group">
                                <div class="field-label">Date de l'événement</div>
                                <p class="field-value">${eventDate}</p>
                            </div>
                            ` : ''}
                            ${numberOfGuests ? `
                            <div class="field-group">
                                <div class="field-label">Nombre d'invités</div>
                                <p class="field-value">${numberOfGuests}</p>
                            </div>
                            ` : ''}
                            ${budgetPerPerson ? `
                            <div class="field-group">
                                <div class="field-label">Budget par personne</div>
                                <p class="field-value">${budgetPerPerson} €</p>
                            </div>
                            ` : ''}
                            ` : ''}

                            ${motif === 'commande' && cartItems && cartItems.length > 0 ? `
                            <h2>Récapitulatif du panier</h2>
                            <div class="field-group">
                                <ul>
                                    ${cartItems.map((item: any) => `
                                        <li>
                                            <strong>${item.name}</strong><br>
                                            Quantité: ${item.quantity} × ${item.price.toFixed(2)} € = ${(item.price * item.quantity).toFixed(2)} €
                                        </li>
                                    `).join('')}
                                </ul>
                                ${cartTotal ? `
                                <p style="margin-top: 15px; font-weight: 600; font-size: 16px;">
                                    Total: ${cartTotal.toFixed(2)} €
                                </p>
                                ` : ''}
                            </div>
                            ` : ''}

                            <h2>Message</h2>
                            <div class="field-group">
                                <p class="field-value" style="white-space: pre-wrap;">${message}</p>
                            </div>

                            <a href="${orderDetailsUrl}" class="button">Voir les détails de la commande</a>

                            <div class="footer">
                                <p>ID de la commande: ${orderId}</p>
                                <p>Date de création: ${new Date(now).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</p>
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
