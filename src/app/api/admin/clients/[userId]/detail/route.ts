import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        // Vérifier l'authentification
        const session = await auth.api.getSession({ headers: request.headers });
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Vérifier que l'utilisateur est administrateur
        const user = await db.get<any>('SELECT * FROM "user" WHERE id = ?', [session.user.id]);
        
        if (!user || user.type !== 'administrateur') {
            return NextResponse.json(
                { error: 'Accès refusé. Administrateur requis.' },
                { status: 403 }
            );
        }

        const { userId } = await params;

        // Récupérer les informations du client
        const client = await db.get<any>('SELECT * FROM "user" WHERE id = ?', [userId]);
        
        if (!client) {
            return NextResponse.json(
                { error: 'Client introuvable' },
                { status: 404 }
            );
        }

        // Récupérer les adresses
        const addresses = await db.query<any>(`
            SELECT * FROM addresses
            WHERE "userId" = ?
            ORDER BY "createdAt" DESC
        `, [userId]);

        // Récupérer les commandes
        const orders = await db.query<any>(`
            SELECT 
                id,
                type,
                status,
                total,
                items,
                "serviceType",
                "createdAt",
                "updatedAt"
            FROM orders
            WHERE "userId" = ?
            ORDER BY "createdAt" DESC
        `, [userId]);

        // Calculer les statistiques
        const orderCount = orders.length;
        const lastOrder = orders[0] || null;
        const averagePrice = orderCount > 0 
            ? orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0) / orderCount 
            : 0;

        // Récupérer les messages en attente
        const pendingMessages = await db.query<any>(`
            SELECT id, motif, message, "createdAt"
            FROM contact_messages
            WHERE "userId" = ? AND status = 'pending'
            ORDER BY "createdAt" DESC
        `, [userId]);

        return NextResponse.json({
            client: {
                id: client.id,
                firstName: client.firstName || '',
                lastName: client.lastName || '',
                email: client.email,
                phone: client.phone || '',
                type: client.type || 'particulier',
                raisonSociale: client.raisonSociale || '',
                allergies: client.allergies || '',
                createdAt: client.createdAt
            },
            addresses: addresses.map(addr => ({
                id: addr.id,
                name: addr.name,
                address: addr.address,
                postalCode: addr.postalCode,
                city: addr.city,
                createdAt: addr.createdAt,
                updatedAt: addr.updatedAt
            })),
            orders: orders.map(order => ({
                ...order,
                items: order.items ? JSON.parse(order.items) : null
            })),
            stats: {
                orderCount,
                averageOrderPrice: averagePrice,
                lastOrderDate: lastOrder ? lastOrder.createdAt : null,
                lastOrderType: lastOrder ? (lastOrder.type === 'product' ? 'Produits' : (lastOrder.serviceType || 'Prestation')) : null,
                lastOrderPrice: lastOrder ? lastOrder.total : null
            },
            pendingMessages
        });
    } catch (error: any) {
        console.error('[API] Erreur admin/clients/[userId]/detail:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération des détails' },
            { status: 500 }
        );
    }
}
