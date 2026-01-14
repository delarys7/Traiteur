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
        const user = db.prepare('SELECT type FROM user WHERE id = ?').get(session.user.id) as { type: string } | undefined;
        if (!user || user.type !== 'administrateur') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { orderId } = await params;
        const { reason } = await request.json();

        if (!reason || !reason.trim()) {
            return NextResponse.json({ error: 'Le motif du refus est obligatoire' }, { status: 400 });
        }

        // Vérifier que la commande existe et est en attente
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
        if (!order) {
            return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
        }

        if (order.status !== 'pending' && order.status !== 'pending_confirmation') {
            return NextResponse.json({ error: 'La commande n\'est pas en attente' }, { status: 400 });
        }

        // Récupérer l'historique actuel
        const currentOrder = db.prepare('SELECT history FROM orders WHERE id = ?').get(orderId) as { history: string } | undefined;
        let history = [];
        if (currentOrder?.history) {
            history = JSON.parse(currentOrder.history);
        }
        
        // Ajouter le nouvel événement à l'historique
        const now = new Date().toISOString();
        history.push({
            status: 'refused',
            date: now,
            label: 'Refusée'
        });
        
        // Mettre à jour le statut avec le motif du refus
        db.prepare(`
            UPDATE orders 
            SET status = 'refused', updatedAt = CURRENT_TIMESTAMP, refusalReason = ?, history = ?
            WHERE id = ?
        `).run(reason, JSON.stringify(history), orderId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API Admin Orders Refuse] Erreur:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
