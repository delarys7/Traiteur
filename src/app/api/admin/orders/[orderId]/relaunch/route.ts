import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import db from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Vérifier que l'utilisateur est administrateur
        const user = await db.get<{ type: string }>('SELECT type FROM "user" WHERE id = ?', [session.user.id]);
        if (!user || user.type !== 'administrateur') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { orderId } = await params;

        // Vérifier que la commande existe et est validée
        const order = await db.get<any>('SELECT * FROM orders WHERE id = ?', [orderId]);
        if (!order) {
            return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
        }

        if (order.status !== 'validated') {
            return NextResponse.json({ error: 'La commande n\'est pas validée' }, { status: 400 });
        }

        // TODO: Envoyer un email de relance
        // Pour l'instant, on met juste à jour la date de mise à jour
        await db.run(`
            UPDATE orders 
            SET "updatedAt" = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [orderId]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API Admin Orders Relaunch] Erreur:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
