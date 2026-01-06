import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { valid: false, error: 'Token manquant' },
                { status: 400 }
            );
        }

        // Rechercher le token dans la table verification
        const verification = db.prepare(`
            SELECT * FROM verification 
            WHERE value = ? AND expiresAt > datetime('now')
        `).get(token) as any;

        if (!verification) {
            return NextResponse.json({
                valid: false,
                error: 'Token invalide ou expiré'
            });
        }

        // Vérifier que l'utilisateur existe
        const user = db.prepare('SELECT * FROM user WHERE email = ?').get(verification.identifier) as any;
        
        if (!user) {
            return NextResponse.json({
                valid: false,
                error: 'Utilisateur introuvable'
            });
        }

        return NextResponse.json({
            valid: true
        });
    } catch (error: any) {
        console.error('[API] Erreur verify token:', error);
        return NextResponse.json(
            { valid: false, error: error.message || 'Erreur de validation' },
            { status: 500 }
        );
    }
}
