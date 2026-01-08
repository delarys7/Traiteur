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
        const user = db.prepare('SELECT * FROM user WHERE id = ?').get(session.user.id) as any;
        
        if (!user || user.type !== 'administrateur') {
            return NextResponse.json(
                { error: 'Accès refusé. Administrateur requis.' },
                { status: 403 }
            );
        }

        // Récupérer tous les utilisateurs (sauf les administrateurs) triés par nom de famille
        const clients = db.prepare(`
            SELECT 
                u.id,
                u.firstName,
                u.lastName,
                u.email,
                u.phone,
                u.type,
                u.raisonSociale,
                u.allergies
            FROM user u
            WHERE u.type != 'administrateur' OR u.type IS NULL
            ORDER BY 
                CASE WHEN u.lastName IS NULL OR u.lastName = '' THEN 1 ELSE 0 END,
                u.lastName ASC,
                u.firstName ASC
        `).all() as any[];

        // Pour chaque client, récupérer les statistiques de commandes
        const clientsWithStats = clients.map(client => {
            // Récupérer toutes les commandes du client
            const orders = db.prepare(`
                SELECT 
                    id,
                    type,
                    total,
                    createdAt,
                    serviceType
                FROM orders
                WHERE userId = ?
                ORDER BY createdAt DESC
            `).all(client.id) as any[];

            const orderCount = orders.length;
            const lastOrder = orders[0] || null;
            const averagePrice = orderCount > 0 
                ? orders.reduce((sum, order) => sum + (order.total || 0), 0) / orderCount 
                : 0;

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
                averageOrderPrice: averagePrice
            };
        });

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
