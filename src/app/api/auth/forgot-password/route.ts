import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, callbackURL } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email requis' },
                { status: 400 }
            );
        }

        // Vérifier que l'utilisateur existe
        const user = db.prepare('SELECT * FROM user WHERE email = ?').get(email) as any;
        
        if (!user) {
            // Pour la sécurité, on ne révèle pas si l'email existe ou non
            return NextResponse.json({ 
                success: true,
                message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
            });
        }

        // Vérifier la clé API Resend
        if (!process.env.RESEND_API_KEY) {
            console.error('[API] RESEND_API_KEY non configurée !');
            return NextResponse.json(
                { error: 'Configuration email manquante' },
                { status: 500 }
            );
        }

        // Générer un token de réinitialisation
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 heure

        // Construire l'URL de base
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || 
            'http://localhost:3000';
        const logoUrl = `${appUrl}/images/Logo-NoBG-rogne.png`;
        
        // Construire l'URL de réinitialisation
        const resetUrl = `${appUrl}/reset-password?token=${token}`;
        
        // Supprimer les anciens tokens de réinitialisation pour cet email
        db.prepare('DELETE FROM verification WHERE identifier = ?').run(email);
        
        // Générer un ID unique pour le token
        const verificationId = randomBytes(16).toString('hex');
        const now = new Date().toISOString();
        
        // Insérer le nouveau token dans la table verification
        db.prepare(`
            INSERT INTO verification (id, identifier, value, expiresAt, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(verificationId, email, token, expiresAt.toISOString(), now, now);

        // Initialiser Resend et envoyer l'email
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        console.log('[API] Envoi d\'email de réinitialisation pour:', user.email);
        console.log('[API] Reset URL:', resetUrl);
        
        const { data, error } = await resend.emails.send({
            from: "Traiteur <contact@delarys.com>",
            to: [user.email],
            subject: "Réinitialisation de votre mot de passe",
            html: `
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
        .logo { padding: 40px 0; text-align: center; }
        .logo img { width: 180px; height: auto; }
        h1 { font-size: 20px; font-weight: 400; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px; color: #1a1a1a; }
        p { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #444444; margin-bottom: 20px; }
        .button-container { padding: 30px 0; }
        .button { background-color: #000000; color: #ffffff !important; padding: 15px 35px; text-decoration: none; font-size: 13px; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px; display: inline-block; border-radius: 2px; }
        .footer { padding: 20px; text-align: center; font-family: Arial, sans-serif; font-size: 11px; color: #999999; border-top: 1px solid #eeeeee; }
        .link-alt { font-size: 10px; color: #999999; word-break: break-all; margin-top: 20px; }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main">
            <tr>
                <td class="logo">
                    <img src="${logoUrl}" alt="Athéna Event Paris" style="display: block; max-width: 180px; height: auto; margin: 0 auto;">
                </td>
            </tr>
            <tr>
                <td class="content">
                    <h1>Réinitialisation du mot de passe</h1>
                    <p>Bonjour ${user.name || user.email},</p>
                    <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                    
                    <div class="button-container">
                        <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
                    </div>
                    
                    <p style="font-size: 12px; color: #999999; margin-top: 30px;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    ATHÉNA EVENT PARIS<br>
                    Traiteur de Haute Gastronomie – Paris<br><br>
                    <div class="link-alt">
                        Si le bouton ne fonctionne pas, copiez ce lien : <br>
                        ${resetUrl}
                    </div>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
            `,
        });

        if (error) {
            console.error('[API] Erreur Resend:', error);
            return NextResponse.json(
                { error: error.message || "Erreur lors de l'envoi de l'email de réinitialisation" },
                { status: 500 }
            );
        }
        
        console.log('[API] Email envoyé avec succès !', data);

        return NextResponse.json({ 
            success: true,
            message: 'Email de réinitialisation envoyé'
        });
    } catch (error: any) {
        console.error('[API] Erreur forgot-password:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation' },
            { status: 500 }
        );
    }
}
