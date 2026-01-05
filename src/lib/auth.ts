import { betterAuth } from "better-auth";
import db from "./db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Vérifier que la base de données est bien connectée
try {
    db.prepare('SELECT 1').get();
    console.log('[Better-Auth] Base de données vérifiée et opérationnelle');
} catch (error) {
    console.error('[Better-Auth] Erreur de connexion à la base de données:', error);
}

export const auth = betterAuth({
    database: db,
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-in-production",
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    user: {
        additionalFields: {
            firstName: { type: "string", required: false },
            lastName: { type: "string", required: false },
            type: { type: "string", required: false, defaultValue: "particulier" }, // 'particulier' | 'entreprise'
            raisonSociale: { type: "string", required: false },
            phone: { type: "string", required: false },
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
        apple: {
            clientId: process.env.APPLE_CLIENT_ID || "",
            teamId: process.env.APPLE_TEAM_ID || "",
            keyId: process.env.APPLE_KEY_ID || "",
            privateKey: process.env.APPLE_PRIVATE_KEY || "",
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }, request) => {
            console.log(`[Better-Auth] Envoi d'email de vérification à: ${user.email}`);
            
            // Construire l'URL absolue du logo
            const baseURL = process.env.NEXT_PUBLIC_APP_URL || 
                (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || 
                "http://localhost:3000";
            const logoURL = `${baseURL}/images/Logo-NoBG-rogné.png`;
            
            // Si pas de clé API Resend, on log juste l'URL pour le développement
            if (!process.env.RESEND_API_KEY) {
                console.warn("[Better-Auth] RESEND_API_KEY non configurée. URL de vérification:", url);
                return; // On retourne sans erreur pour permettre l'inscription en développement
            }
            
            try {
                const { data, error } = await resend.emails.send({
                    from: "Traiteur <contact@delarys.com>",
                    to: [user.email],
                    subject: "Vérifiez votre adresse email",
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
                    <img src="${logoURL}" alt="Athéna Event Paris">
                </td>
            </tr>
            <tr>
                <td class="content">
                    <h1>Une invitation à l'exception</h1>
                    <p>Bonjour ${user.name || ""},</p>
                    <p>Nous sommes enchantés de vous accueillir. Pour accéder à votre espace personnel et commencer la confection de votre prochain événement, merci de valider votre inscription :</p>
                    
                    <div class="button-container">
                        <a href="${url}" class="button">Confirmer mon email</a>
                    </div>
                    
                    <p style="font-style: italic; margin-top: 30px;">L'art de recevoir, tout simplement.</p>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    ATHÉNA EVENT PARIS<br>
                    Traiteur de Haute Gastronomie – Paris<br><br>
                    <div class="link-alt">
                        Si le bouton ne fonctionne pas, copiez ce lien : <br>
                        ${url}
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
                    console.error("[Better-Auth] Erreur Resend:", error);
                    // Ne pas bloquer l'inscription si l'email échoue
                    console.warn("[Better-Auth] L'inscription continue malgré l'erreur d'email. URL:", url);
                } else {
                    console.log("[Better-Auth] Email de vérification envoyé avec succès !", data);
                }
            } catch (err) {
                console.error("[Better-Auth] Erreur critique lors de l'envoi d'email:", err);
                // Ne pas bloquer l'inscription si l'email échoue
                console.warn("[Better-Auth] L'inscription continue malgré l'erreur d'email. URL:", url);
            }
        },
    },
});
