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
        const { reason } = await request.json();

        if (!reason || !reason.trim()) {
            return NextResponse.json({ error: 'Le motif du refus est obligatoire' }, { status: 400 });
        }

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
            status: 'refused',
            date: now,
            label: 'Refusée'
        });
        
        // Mettre à jour le statut avec le motif du refus
        db.prepare(`
            UPDATE orders 
            SET status = 'refused', updatedAt = CURRENT_TIMESTAMP, refusalReason = ?, history = ?
            WHERE id = ?
        `).run(reason, JSON.stringify(history), orderId);

        // --- ENVOI DE L'EMAIL DE REFUS AU CLIENT ---
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
                                .reason-box { background-color: #f9f9f9; border-left: 3px solid #111; padding: 20px; margin: 30px 0; text-align: left; font-family: Arial, sans-serif; font-size: 14px; color: #555; }
                                .footer { margin-top: 50px; font-family: Arial, sans-serif; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                            </style>
                        </head>
                        <body>
                            <div class="wrapper">
                                <div class="container">
                                    <div class="logo-text">ATHÉNA EVENT</div>
                                    
                                    <h1>Concernant votre commande</h1>
                                    
                                    <p>Cher(e) ${client.firstName} ${client.lastName},</p>
                                    
                                    <p>Nous vous remercions de l'intérêt que vous portez à notre Maison.</p>
                                    
                                    <p>Après une étude attentive de votre demande, nous sommes au regret de ne pouvoir y donner une suite favorable en l'état actuel.</p>
                                    
                                    <div class="reason-box">
                                        <strong>Motif :</strong><br>
                                        ${reason}
                                    </div>
                                    
                                    <p>Nous restons à votre entière disposition pour échanger sur ce sujet et espérons avoir l'opportunité de vous accompagner lors d'une prochaine occasion.</p>
                                    
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
                        subject: "Mise à jour concernant votre commande - Athéna Event",
                        html: emailHtml,
                    });
                    console.log(`[API Admin Refuse] Email de refus envoyé à ${client.email}`);
                }
            } catch (emailError) {
                console.error('[API Admin Refuse] Erreur envoi email:', emailError);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API Admin Orders Refuse] Erreur:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
