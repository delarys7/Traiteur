import { betterAuth } from "better-auth";
import db from "./db";

export const auth = betterAuth({
    database: db,
    emailAndPassword: {
        enabled: true
    },
    user: {
        additionalFields: {
            firstName: {
                type: "string",
                required: false,
            },
            lastName: {
                type: "string",
                required: false,
            },
            type: {
                type: "string", // 'particulier' | 'entreprise'
                required: false,
                defaultValue: "particulier",
            },
            raisonSociale: {
                type: "string",
                required: false,
            },
            phone: {
                type: "string",
                required: false,
            }
        }
    }
});
