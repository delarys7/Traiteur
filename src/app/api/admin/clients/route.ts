import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
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

        // Récupérer tous les utilisateurs (sauf les administrateurs) triés par nom de famille
        const clients = await db.query<any>(`
            SELECT 
                u.id,
                u."firstName",
                u."lastName",
                u.email,
                u.phone,
                u.type,
                u."raisonSociale",
                u.allergies
            FROM "user" u
            WHERE u.type != 'administrateur' OR u.type IS NULL
            ORDER BY 
                CASE WHEN u."lastName" IS NULL OR u."lastName" = '' THEN 1 ELSE 0 END,
                u."lastName" ASC,
                u."firstName" ASC
        `);

        // Pour chaque client, récupérer les statistiques de commandes et le statut des messages
        const clientsWithStats = await Promise.all(clients.map(async (client) => {
            // Récupérer toutes les commandes du client
            const orders = await db.query<any>(`
                SELECT id, type, total, "createdAt", "serviceType", status
                FROM orders
                WHERE "userId" = ?
                ORDER BY "createdAt" DESC
            `, [client.id]);

            const orderCount = orders.length;
            const lastOrder = orders[0] || null;
            const averagePrice = orderCount > 0 
                ? orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0) / orderCount 
                : 0;

            // Récupérer la commande en cours
            const activeOrder = await db.get<{ id: string }>(`
                SELECT id 
                FROM orders 
                WHERE "userId" = ? 
                AND status NOT IN ('received', 'refused')
                AND ("serviceType" = 'commande' OR type = 'product')
                ORDER BY "createdAt" DESC 
                LIMIT 1
            `, [client.id]);

            // Récupérer la demande de service en cours
            const activeServiceRequest = await db.get<{ id: string }>(`
                SELECT id 
                FROM orders 
                WHERE "userId" = ? 
                AND status NOT IN ('received', 'refused')
                AND "serviceType" NOT IN ('commande', 'autre')
                ORDER BY "createdAt" DESC 
                LIMIT 1
            `, [client.id]);

            // Récupérer le dernier message en attente
            const pendingMessage = await db.get<{ motif: string }>(`
                SELECT motif
                FROM contact_messages
                WHERE "userId" = ? AND status = 'pending'
                ORDER BY "createdAt" DESC
                LIMIT 1
            `, [client.id]);

            return {
                id: client.id,
                firstName: client.firstName || '',
                lastName: client.lastName || '',
                email: client.email,
                phone: client.phone || '',
                type: client.type || 'particulier',
                entreprise: client.type === 'entreprise' ? (client.raisonSociale || '') : '',
                allergies: client.type === 'particulier' ? (client.allergies || '') : '',
                orderCount,
                lastOrderDate: lastOrder ? lastOrder.createdAt : null,
                lastOrderType: lastOrder ? (lastOrder.type === 'product' ? 'Produits' : (lastOrder.serviceType || 'Prestation')) : null,
                averageOrderPrice: averagePrice,
                activeOrderId: activeOrder?.id || null,
                activeServiceRequestId: activeServiceRequest?.id || null,
                pendingMessageMotif: pendingMessage ? pendingMessage.motif : null
            };
        }));

        return NextResponse.json({
            clients: clientsWithStats
        });
    } catch (error: any) {
        console.error('[API] Erreur admin/clients:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération des clients' },
            { status: 500 }
        );
    }
}
