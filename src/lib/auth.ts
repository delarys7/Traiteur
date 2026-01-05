import { betterAuth } from "better-auth";
import db from "./db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    database: db,
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
            
            try {
                const { data, error } = await resend.emails.send({
                    from: "Traiteur <contact@delarys.com>",
                    to: [user.email],
                    subject: "Vérifiez votre adresse email",
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                            <h1 style="color: #1a1a1a;">Maison de Haute Gastronomie</h1>
                            <p>Bonjour ${user.name || ""},</p>
                            <p>Merci de cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
                            <div style="margin: 30px 0;">
                                <a href="${url}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                                    Vérifier mon email
                                </a>
                            </div>
                            <p style="color: #666; font-size: 14px;">Si le bouton ne fonctionne pas, copiez ce lien : ${url}</p>
                        </div>
                    `,
                });

                if (error) {
                    console.error("[Better-Auth] Erreur Resend:", error);
                } else {
                    console.log("[Better-Auth] Email de vérification envoyé avec succès !", data);
                }
            } catch (err) {
                console.error("[Better-Auth] Erreur critique lors de l'envoi d'email:", err);
            }
        },
    },
});
