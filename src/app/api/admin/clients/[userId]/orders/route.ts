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
        const user = db.prepare('SELECT * FROM user WHERE id = ?').get(session.user.id) as any;
        
        if (!user || user.type !== 'administrateur') {
            return NextResponse.json(
                { error: 'Accès refusé. Administrateur requis.' },
                { status: 403 }
            );
        }

        const { userId } = await params;

        // Récupérer les informations du client
        const client = db.prepare('SELECT * FROM user WHERE id = ?').get(userId) as any;
        
        if (!client) {
            return NextResponse.json(
                { error: 'Client introuvable' },
                { status: 404 }
            );
        }

        // Récupérer toutes les commandes du client
        const orders = db.prepare(`
            SELECT 
                id,
                type,
                status,
                total,
                items,
                serviceType,
                createdAt,
                updatedAt
            FROM orders
            WHERE userId = ?
            ORDER BY createdAt DESC
        `).all(userId) as any[];

        // Parser les items JSON
        const ordersWithParsedItems = orders.map(order => ({
            ...order,
            items: order.items ? JSON.parse(order.items) : null
        }));

        return NextResponse.json({
            client: {
                id: client.id,
                firstName: client.firstName || '',
                lastName: client.lastName || '',
                email: client.email,
                phone: client.phone || '',
                type: client.type || 'particulier',
                entreprise: client.type === 'entreprise' ? (client.raisonSociale || '') : '',
                allergies: client.type === 'particulier' ? (client.allergies || '') : ''
            },
            orders: ordersWithParsedItems
        });
    } catch (error: any) {
        console.error('[API] Erreur admin/clients/[userId]/orders:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération des commandes' },
            { status: 500 }
        );
    }
}
