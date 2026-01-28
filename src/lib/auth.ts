import { betterAuth } from "better-auth";
import { pool } from "./db";
import { Resend } from "resend";
import { hash, compare } from "bcrypt";

// Initialiser Resend seulement quand on en a besoin
const getResend = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    return new Resend(apiKey);
};

const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const auth = betterAuth({
    database: pool,
    baseURL: baseURL,
    trustedOrigins: [
        "https://athena-event.vercel.app",
        "https://athena-event-git-main-delarys7s-projects.vercel.app",
        process.env.NEXT_PUBLIC_APP_URL as string,
    ].filter(Boolean),
    secret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-in-production",
    
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        // better-auth utilise scrypt par défaut, ce qui est plus sûr sur Vercel que bcrypt (problèmes de binaires natifs)
        
        sendResetPassword: async ({ user, url, token }) => {
            try {
                console.log(`[Better-Auth] Réinitialisation pour: ${user.email}`);
                const resend = getResend();
                if (!resend) return;

                const logoUrl = `${baseURL}/images/Logo-NoBG-rogne.png`;
                
                await resend.emails.send({
                    from: "Athéna Event <contact@delarys.com>",
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
                        <a href="${url}" class="button">Réinitialiser mon mot de passe</a>
                    </div>
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
                    `
                });
            } catch (err) {
                console.error('[Better-Auth] EXCEPTION dans sendResetPassword:', err);
            }
        }
    },
    
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }) => {
            try {
                console.log(`[Better-Auth] Tentative d'envoi d'email à: ${user.email}`);
                
                const resend = getResend();
                if (!resend) {
                    console.error('[Better-Auth] ERREUR: Resend non configuré');
                    return;
                }

                const logoUrl = `${baseURL}/images/Logo-NoBG-rogne.png`;
                
                // Personnalisation du message de bienvenue pour les pros
                const userName = user.name || user.email;
                const companySuffix = (user as any).raisonSociale ? ` (${(user as any).raisonSociale})` : "";
                const greeting = `Bonjour ${userName}${companySuffix},`;

                const { data, error } = await resend.emails.send({
                    from: "Athéna Event <contact@delarys.com>",
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
                    <img src="${logoUrl}" alt="Athéna Event Paris" style="display: block; max-width: 180px; height: auto; margin: 0 auto;">
                </td>
            </tr>
            <tr>
                <td class="content">
                    <h1>UNE INVITATION À L'EXCEPTION</h1>
                    <p>${greeting}</p>
                    <p>Nous sommes enchantés de vous accueillir. Pour accéder à votre espace personnel et commencer la confection de votre prochain événement, merci de valider votre inscription :</p>
                    
                    <div class="button-container">
                        <a href="${url}" class="button">CONFIRMER MON EMAIL</a>
                    </div>
                    
                    <p style="font-style: italic; font-size: 12px; color: #999999; margin-top: 30px;">L'art de recevoir, tout simplement.</p>
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
                    `
                });

                if (error) {
                    console.error('[Better-Auth] ERREUR Resend:', error);
                } else {
                    console.log('[Better-Auth] Email envoyé avec succès, ID:', data?.id);
                }
            } catch (err) {
                console.error('[Better-Auth] EXCEPTION dans sendVerificationEmail:', err);
            }
        }
    },

    user: {
        fields: {
            emailVerified: 'emailVerified',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        },
        additionalFields: {
            firstName: { type: "string", required: false },
            lastName: { type: "string", required: false },
            type: { type: "string", required: false, defaultValue: "particulier" }, // 'particulier' | 'entreprise'
            raisonSociale: { type: "string", required: false },
            phone: { type: "string", required: false },
            allergies: { type: "string", required: false },
        },
    },

    session: {
        fields: {
            expiresAt: 'expiresAt',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
            ipAddress: 'ipAddress',
            userAgent: 'userAgent',
            userId: 'userId'
        }
    },

    account: {
        fields: {
            accountId: 'accountId',
            providerId: 'providerId',
            userId: 'userId',
            accessToken: 'accessToken',
            refreshToken: 'refreshToken',
            idToken: 'idToken',
            accessTokenExpiresAt: 'accessTokenExpiresAt',
            refreshTokenExpiresAt: 'refreshTokenExpiresAt',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    },

    verification: {
        fields: {
            expiresAt: 'expiresAt',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    },

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }
    }
});
