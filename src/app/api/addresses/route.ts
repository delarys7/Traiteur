import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { randomBytes } from 'crypto';

// GET - Récupérer les adresses de l'utilisateur
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const addresses = await db.query(`
            SELECT id, name, address, "postalCode", city, "createdAt", "updatedAt"
            FROM addresses
            WHERE "userId" = ?
            ORDER BY "createdAt" DESC
        `, [session.user.id]);

        return NextResponse.json({ addresses });
    } catch (error: any) {
        console.error('[API] Erreur GET addresses:', error);
        return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
}

// POST - Ajouter une nouvelle adresse
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const body = await request.json();
        const { name, address, postalCode, city } = body;

        if (!name || !address || !postalCode || !city) {
            return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
        }

        const id = randomBytes(16).toString('hex');
        const now = new Date().toISOString();

        await db.run(`
            INSERT INTO addresses (id, "userId", name, address, "postalCode", city, "createdAt", "updatedAt")
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, session.user.id, name, address, postalCode, city, now, now]);

        return NextResponse.json({ 
            success: true, 
            address: { id, name, address, postalCode, city, createdAt: now, updatedAt: now }
        });
    } catch (error: any) {
        console.error('[API] Erreur POST addresses:', error);
        return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
}

// PUT - Mettre à jour une adresse
export async function PUT(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, address, postalCode, city } = body;

        if (!id || !name || !address || !postalCode || !city) {
            return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
        }

        // Vérifier que l'adresse appartient à l'utilisateur
        const existingAddress = await db.get<{ userId: string }>('SELECT "userId" FROM addresses WHERE id = ?', [id]);
        
        if (!existingAddress) {
            return NextResponse.json({ error: 'Adresse non trouvée' }, { status: 404 });
        }

        if (existingAddress.userId !== session.user.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        const now = new Date().toISOString();

        await db.run(`
            UPDATE addresses 
            SET name = ?, address = ?, "postalCode" = ?, city = ?, "updatedAt" = ?
            WHERE id = ?
        `, [name, address, postalCode, city, now, id]);

        const updatedAddress = await db.get<any>('SELECT * FROM addresses WHERE id = ?', [id]);

        return NextResponse.json({ 
            success: true, 
            address: updatedAddress
        });
    } catch (error: any) {
        console.error('[API] Erreur PUT addresses:', error);
        return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
}

// DELETE - Supprimer une adresse
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const addressId = searchParams.get('id');

        if (!addressId) {
            return NextResponse.json({ error: 'ID d\'adresse requis' }, { status: 400 });
        }

        // Vérifier que l'adresse appartient à l'utilisateur
        const address = await db.get<{ userId: string }>('SELECT "userId" FROM addresses WHERE id = ?', [addressId]);
        
        if (!address) {
            return NextResponse.json({ error: 'Adresse non trouvée' }, { status: 404 });
        }

        if (address.userId !== session.user.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        await db.run('DELETE FROM addresses WHERE id = ?', [addressId]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API] Erreur DELETE addresses:', error);
        return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
}
