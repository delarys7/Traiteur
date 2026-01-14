import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import db from '@/lib/db';

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        console.log('[API Orders] Fetching for user:', session.user.id);

        const orders = db.prepare(`
            SELECT * FROM orders 
            WHERE userId = ? 
            ORDER BY createdAt DESC
        `).all(session.user.id);

        // Parser les items et l'historique JSON
        const parsedOrders = orders.map((order: any) => ({
            ...order,
            items: order.items ? JSON.parse(order.items) : [],
            history: order.history ? JSON.parse(order.history) : []
        }));

        return NextResponse.json({ orders: parsedOrders });
    } catch (error: any) {
        console.error('[API Orders] Erreur:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
