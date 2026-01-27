import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  // baseURL est omis pour utiliser automatiquement l'origin courante du navigateur
})

export const { signIn, signUp, useSession, signOut } = authClient;
