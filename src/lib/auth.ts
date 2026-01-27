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

const baseURL = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const auth = betterAuth({
    database: {
        db: pool,
        type: "postgres"
    },
    baseURL: baseURL,
    // On laisse better-auth gérer les origines de confiance par défaut 
    // ou on en ajoute si on détecte une adresse spécifique plus tard
    secret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-in-production",
    
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        // better-auth utilise scrypt par défaut, ce qui est plus sûr sur Vercel que bcrypt (problèmes de binaires natifs)
        
        // Nom correct pour v1 : sendResetPassword
        sendResetPassword: async ({ user, url, token }) => {
            console.log(`[Better-Auth] Envoi d'email de réinitialisation à: ${user.email}`);
            const resend = getResend();
            if (!resend) return;
            
            await resend.emails.send({
                from: "Traiteur <contact@delarys.com>",
                to: [user.email],
                subject: "Réinitialisation de votre mot de passe",
                html: `<p>Bonjour ${user.name},</p><p>Cliquez ici pour réinitialiser : <a href="${url}">${url}</a></p>`
            });
        }
    },
    
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }) => {
            console.log(`[Better-Auth] Envoi d'email de vérification à: ${user.email}`);
            const resend = getResend();
            if (!resend) return;
            
            await resend.emails.send({
                from: "Traiteur <contact@delarys.com>",
                to: [user.email],
                subject: "Vérifiez votre adresse email",
                html: `<p>Bonjour ${user.name},</p><p>Cliquez ici pour valider : <a href="${url}">${url}</a></p>`
            });
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
