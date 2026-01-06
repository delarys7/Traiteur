import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hash } from 'bcrypt';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token et mot de passe requis' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 6 caractères' },
                { status: 400 }
            );
        }

        // Rechercher le token dans la table verification
        const verification = db.prepare(`
            SELECT * FROM verification 
            WHERE value = ? AND expiresAt > datetime('now')
        `).get(token) as any;

        if (!verification) {
            return NextResponse.json(
                { error: 'Token invalide ou expiré' },
                { status: 400 }
            );
        }

        // Récupérer l'utilisateur
        const user = db.prepare('SELECT * FROM user WHERE email = ?').get(verification.identifier) as any;
        
        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur introuvable' },
                { status: 404 }
            );
        }

        // Récupérer le compte associé (better-auth utilise 'credential' pour email/password)
        const account = db.prepare('SELECT * FROM account WHERE userId = ? AND providerId = ?').get(user.id, 'credential') as any;
        
        // Si pas trouvé avec 'credential', chercher n'importe quel compte avec un mot de passe
        let accountToUpdate = account;
        if (!accountToUpdate) {
            accountToUpdate = db.prepare('SELECT * FROM account WHERE userId = ? AND password IS NOT NULL').get(user.id) as any;
        }
        
        if (!accountToUpdate) {
            return NextResponse.json(
                { error: 'Compte introuvable' },
                { status: 404 }
            );
        }

        // IMPORTANT : Supprimer toutes les sessions existantes pour cet utilisateur
        // pour éviter qu'il soit automatiquement connecté après la réinitialisation
        db.prepare('DELETE FROM session WHERE userId = ?').run(user.id);
        console.log('[API] Toutes les sessions supprimées pour:', user.email);

        // Hasher le nouveau mot de passe avec bcrypt (comme better-auth)
        // Better-auth utilise bcrypt avec 10 rounds (format $2b$10$...)
        const hashedPassword = await hash(password, 10);
        
        // Vérifier le format généré
        if (!hashedPassword.startsWith('$2b$10$')) {
            throw new Error('Format de hachage invalide');
        }
        
        console.log('[API] Hash généré (premiers 30 caractères):', hashedPassword.substring(0, 30));
        console.log('[API] Hash complet:', hashedPassword);

        // Mettre à jour le mot de passe dans la table account
        const now = new Date().toISOString();
        const updateResult = db.prepare(`
            UPDATE account 
            SET password = ?, updatedAt = ?
            WHERE id = ?
        `).run(hashedPassword, now, accountToUpdate.id);
        
        console.log('[API] Lignes affectées par UPDATE:', updateResult.changes);
        console.log('[API] Account ID mis à jour:', accountToUpdate.id);

        // Vérifier que le mot de passe a bien été mis à jour
        const updatedAccount = db.prepare('SELECT password FROM account WHERE id = ?').get(accountToUpdate.id) as any;
        if (updatedAccount && updatedAccount.password) {
            console.log('[API] Mot de passe après UPDATE (premiers 30 caractères):', updatedAccount.password.substring(0, 30));
            console.log('[API] Les deux hash correspondent:', updatedAccount.password === hashedPassword);
        }

        // Supprimer le token de réinitialisation utilisé
        db.prepare('DELETE FROM verification WHERE value = ?').run(token);

        console.log('[API] Mot de passe réinitialisé pour:', user.email);

        return NextResponse.json({
            success: true,
            message: 'Mot de passe réinitialisé avec succès'
        });
    } catch (error: any) {
        console.error('[API] Erreur reset-password:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la réinitialisation' },
            { status: 500 }
        );
    }
}
