import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import db from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Vérifier que l'utilisateur est administrateur
        const user = db.prepare('SELECT type FROM user WHERE id = ?').get(session.user.id) as { type: string } | undefined;
        if (!user || user.type !== 'administrateur') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { orderId } = await params;

        // Vérifier que la commande existe et est en attente
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
        if (!order) {
            return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
        }

        if (order.status !== 'pending' && order.status !== 'pending_confirmation') {
            return NextResponse.json({ error: 'La commande n\'est pas en attente' }, { status: 400 });
        }

        // Récupérer l'historique actuel
        const currentOrder = db.prepare('SELECT history FROM orders WHERE id = ?').get(orderId) as { history: string } | undefined;
        let history = [];
        if (currentOrder?.history) {
            history = JSON.parse(currentOrder.history);
        }
        
        // Ajouter le nouvel événement à l'historique
        const now = new Date().toISOString();
        history.push({
            status: 'validated',
            date: now,
            label: 'Approuvée'
        });
        
        // Mettre à jour le statut et l'historique
        db.prepare(`
            UPDATE orders 
            SET status = 'validated', updatedAt = CURRENT_TIMESTAMP, history = ?
            WHERE id = ?
        `).run(JSON.stringify(history), orderId);

        // --- ENVOI DE L'EMAIL DE CONFIRMATION AU CLIENT ---
        if (process.env.RESEND_API_KEY) {
            try {
                // Récupérer l'email du client
                const client = db.prepare('SELECT u.email, u.firstName, u.lastName FROM orders o JOIN user u ON o.userId = u.id WHERE o.id = ?').get(orderId) as any;
                
                if (client && client.email) {
                    const { Resend } = require('resend');
                    const resend = new Resend(process.env.RESEND_API_KEY);
                    const baseURL = process.env.NEXT_PUBLIC_APP_URL || 
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || 
                        "http://localhost:3000";
                    
                    const logoURL = `https://utfs.io/f/8a4b0c5e-3043-4a3b-a526-267d09cf7ea3-logo.png`;

                    const emailHtml = `
                        <!DOCTYPE html>
                        <html lang="fr">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                body { font-family: 'Times New Roman', Times, serif; background-color: #ffffff; margin: 0; padding: 0; }
                                .wrapper { width: 100%; background-color: #ffffff; padding: 40px 0; }
                                .container { max-width: 600px; margin: 0 auto; text-align: center; color: #1a1a1a; }
                                .logo-text { font-size: 24px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 40px; display: block; color: #000; text-decoration: none; }
                                h1 { font-size: 22px; font-weight: 400; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 30px; }
                                p { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.8; color: #444; margin-bottom: 20px; }
                                .button { background-color: #111; color: #fff !important; padding: 12px 25px; text-decoration: none; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; display: inline-block; margin-top: 30px; }
                                .footer { margin-top: 50px; font-family: Arial, sans-serif; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                            </style>
                        </head>
                        <body>
                            <div class="wrapper">
                                <div class="container">
                                    <div class="logo-text">ATHÉNA EVENT</div>
                                    
                                    <h1>Votre commande est confirmée</h1>
                                    
                                    <p>Cher(e) ${client.firstName} ${client.lastName},</p>
                                    
                                    <p>C'est avec un immense plaisir que nous vous confirmons la validation de votre commande.</p>
                                    
                                    <p>Nos équipes vont désormais s'atteler à la préparation de votre événement avec tout le soin et l'exigence qui caractérisent notre Maison. Chaque détail sera orchestré pour vous offrir une expérience inoubliable.</p>
                                    
                                    <p style="font-style: italic; margin-top: 30px; font-family: 'Times New Roman', Times, serif; font-size: 16px;">"L'excellence est un art que nous cultivons pour vous."</p>

                                    <a href="${baseURL}/compte" class="button">Accéder à mon espace client</a>

                                    <div class="footer">
                                        ATHÉNA EVENT PARIS<br>
                                        Commande #${orderId}
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                    `;

                    await resend.emails.send({
                        from: "Traiteur <contact@delarys.com>",
                        to: [client.email],
                        subject: "Confirmation de votre commande - Athéna Event",
                        html: emailHtml,
                    });
                    console.log(`[API Admin Validate] Email de validation envoyé à ${client.email}`);
                }
            } catch (emailError) {
                console.error('[API Admin Validate] Erreur envoi email:', emailError);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API Admin Orders Validate] Erreur:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
