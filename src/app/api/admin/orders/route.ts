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

        // Vérifier que l'utilisateur est administrateur
        const user = db.prepare('SELECT type FROM user WHERE id = ?').get(session.user.id) as { type: string } | undefined;
        if (!user || user.type !== 'administrateur') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        // Récupérer toutes les commandes avec les informations utilisateur et les messages de contact
        const orders = db.prepare(`
            SELECT 
                o.id,
                o.userId,
                o.type,
                o.status,
                o.total,
                o.items,
                o.serviceType,
                o.createdAt,
                o.updatedAt,
                o.history,
                u.firstName,
                u.lastName,
                u.type as userType,
                u.email,
                u.phone,
                u.raisonSociale as entreprise,
                cm.motif,
                cm.message as contactMessage,
                cm.phone as contactPhone,
                cm.entreprise as contactEntreprise,
                cm.createdAt as contactCreatedAt,
                cm.manualAddress,
                cm.manualPostalCode,
                cm.manualCity,
                cm.selectedAddress,
                addr.name as addrName,
                addr.address as addrStreet,
                addr.postalCode as addrZip,
                addr.city as addrCity
            FROM orders o
            LEFT JOIN user u ON o.userId = u.id
            LEFT JOIN contact_messages cm ON cm.userId = o.userId 
                AND cm.motif = o.serviceType 
                AND DATE(cm.createdAt) = DATE(o.createdAt)
            LEFT JOIN addresses addr ON cm.selectedAddress = addr.id
            ORDER BY o.updatedAt DESC
        `).all();

        // Parser les items JSON et calculer la date de MAJ depuis l'historique
        const parsedOrders = orders.map((order: any) => {
            const history = order.history ? JSON.parse(order.history) : [];
            // Utiliser la date du dernier événement de l'historique comme date de MAJ
            let lastUpdateDate = order.updatedAt;
            if (history && history.length > 0) {
                // Prendre la date du dernier événement
                const lastEvent = history[history.length - 1];
                if (lastEvent && lastEvent.date) {
                    lastUpdateDate = lastEvent.date;
                }
            }

            // Construire l'objet adresse unifié
            let addressDisplay = null;
            if (order.manualAddress) {
                addressDisplay = `${order.manualAddress}, ${order.manualPostalCode} ${order.manualCity}`;
            } else if (order.addrStreet) {
                addressDisplay = `${order.addrStreet}, ${order.addrZip} ${order.addrCity}`;
            }
            
            return {
                ...order,
                items: order.items ? JSON.parse(order.items) : [],
                history: history,
                updatedAt: lastUpdateDate, // Utiliser la date de l'historique
                contactData: {
                    motif: order.motif,
                    message: order.contactMessage,
                    phone: order.contactPhone || order.phone,
                    entreprise: order.contactEntreprise || order.entreprise,
                    // Ajouter l'objet adresse
                    address: addressDisplay
                }
            };
        });

        return NextResponse.json({ orders: parsedOrders });
    } catch (error: any) {
        console.error('[API Admin Orders] Erreur:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
