import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

// PUT - Mettre à jour le profil utilisateur
export async function PUT(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const body = await request.json();
        const { firstName, lastName, phone, raisonSociale } = body;

        console.log('[API] Mise à jour profil:', { userId: session.user.id, body });

        // Mettre à jour les champs dans la base de données
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (firstName !== undefined) {
            updateFields.push('firstName = ?');
            updateValues.push(firstName);
        }
        if (lastName !== undefined) {
            updateFields.push('lastName = ?');
            updateValues.push(lastName);
        }
        if (phone !== undefined) {
            updateFields.push('phone = ?');
            updateValues.push(phone);
        }
        if (raisonSociale !== undefined) {
            updateFields.push('raisonSociale = ?');
            updateValues.push(raisonSociale);
        }

        if (updateFields.length === 0) {
            return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
        }

        updateFields.push('updatedAt = ?');
        updateValues.push(new Date().toISOString());
        updateValues.push(session.user.id);

        const updateQuery = `
            UPDATE user 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `;

        const result = db.prepare(updateQuery).run(...updateValues);
        console.log('[API] Résultat mise à jour:', result);

        // Récupérer l'utilisateur mis à jour
        const updatedUser = db.prepare('SELECT * FROM user WHERE id = ?').get(session.user.id);
        console.log('[API] Utilisateur mis à jour:', updatedUser);

        return NextResponse.json({ 
            success: true, 
            user: updatedUser
        });
    } catch (error: any) {
        console.error('[API] Erreur PUT profile:', error);
        return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
}
