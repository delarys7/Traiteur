import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import db from '@/lib/db';

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await req.json();
        const { orderId, type } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'ID de commande manquant' }, { status: 400 });
        }

        // Vérifier que la commande appartient à l'utilisateur et est reçue
        const order = db.prepare('SELECT status FROM orders WHERE id = ? AND userId = ?').get(orderId, session.user.id) as any;
        if (!order) {
            return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
        }
        if (order.status !== 'received') {
            return NextResponse.json({ error: 'Vous ne pouvez laisser un avis que sur une commande reçue' }, { status: 400 });
        }

        const transaction = db.transaction(() => {
            if (type === 'global') {
                const { rating, comment } = body;
                db.prepare(`
                    INSERT INTO reviews (productId, userId, rating, comment, orderId, isOrderReview)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(-1, session.user.id, rating, comment, orderId, 1);
            } else {
                const { reviews, generalComment } = body;
                
                // Insérer les avis par produit
                for (const [productId, reviewData] of Object.entries(reviews) as any) {
                    db.prepare(`
                        INSERT INTO reviews (productId, userId, rating, comment, orderId, isOrderReview)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `).run(Number(productId), session.user.id, reviewData.rating, reviewData.comment, orderId, 0);
                }

                // Optionnellement insérer un avis global si le commentaire général est rempli
                if (generalComment) {
                    db.prepare(`
                        INSERT INTO reviews (productId, userId, rating, comment, orderId, isOrderReview)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `).run(-1, session.user.id, 5, generalComment, orderId, 1);
                }
            }
        });

        transaction();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API Reviews] Erreur:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return NextResponse.json({ error: 'Vous avez déjà laissé un avis pour cette commande ou l\'un de ses produits.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
