import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await params;
        
        // Calculer la moyenne des notes et le nombre d'avis
        const stats = db.prepare(`
            SELECT 
                COALESCE(AVG(rating), 0) as averageRating,
                COUNT(*) as reviewCount
            FROM reviews
            WHERE productId = ?
        `).get(parseInt(productId));

        return NextResponse.json({
            averageRating: stats ? parseFloat(stats.averageRating as string) : 0,
            reviewCount: stats ? (stats.reviewCount as number) : 0
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
