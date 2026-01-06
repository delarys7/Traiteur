import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Resend } from 'resend';

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
        const { name, email, phone, motif, message, cartItems, cartTotal } = body;

        if (!name || !email || !motif || !message) {
            return NextResponse.json(
                { error: 'Tous les champs requis doivent être remplis' },
                { status: 400 }
            );
        }

        if (message.trim().length < 10) {
            return NextResponse.json(
                { error: 'Le message doit contenir au moins 10 caractères' },
                { status: 400 }
            );
        }

        // Construire le contenu de l'email
        let emailContent = `
            <h2>Nouveau message de contact</h2>
            <p><strong>Nom/Entreprise:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Téléphone:</strong> ${phone}</p>` : ''}
            <p><strong>Motif:</strong> ${getMotifLabel(motif)}</p>
        `;

        // Ajouter le récapitulatif du panier si c'est une commande
        if (motif === 'commande' && cartItems && cartItems.length > 0) {
            emailContent += `
                <h3>Récapitulatif du panier:</h3>
                <ul>
            `;
            cartItems.forEach((item: any) => {
                emailContent += `<li>${item.name} - Quantité: ${item.quantity} - Prix unitaire: ${(item.price / 100).toFixed(2)} € - Total: ${((item.price * item.quantity) / 100).toFixed(2)} €</li>`;
            });
            emailContent += `</ul>`;
            if (cartTotal) {
                emailContent += `<p><strong>Total du panier:</strong> ${(cartTotal / 100).toFixed(2)} €</p>`;
            }
        }

        emailContent += `
            <h3>Message:</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `;

        // Envoyer l'email
        if (process.env.RESEND_API_KEY) {
            try {
                const { data, error } = await resend.emails.send({
                    from: "Traiteur <contact@delarys.com>",
                    to: ["contact@delarys.com"], // Email de réception
                    replyTo: email,
                    subject: `Nouveau message de contact - ${getMotifLabel(motif)}`,
                    html: `
                        <!DOCTYPE html>
                        <html lang="fr">
                        <head>
                            <meta charset="UTF-8">
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                h2 { color: #111; }
                                h3 { color: #111; margin-top: 1.5rem; }
                                p { margin: 0.5rem 0; }
                                ul { margin: 0.5rem 0; padding-left: 1.5rem; }
                            </style>
                        </head>
                        <body>
                            ${emailContent}
                        </body>
                        </html>
                    `,
                });

                if (error) {
                    console.error('[API] Erreur Resend:', error);
                    // Ne pas bloquer l'envoi si l'email échoue
                } else {
                    console.log('[API] Email de contact envoyé avec succès !', data);
                }
            } catch (emailError) {
                console.error('[API] Erreur lors de l\'envoi de l\'email:', emailError);
                // Ne pas bloquer l'envoi si l'email échoue
            }
        }

        // TODO: Optionnellement, sauvegarder le message en base de données

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
        'autre': 'Autre (renseignements, etc.)'
    };
    return labels[motif] || motif;
}
