import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');

        let query = 'SELECT * FROM products';
        const params = [];

        if (category) {
            // Use ILIKE for case-insensitive matching in PostgreSQL
            query += ' WHERE category ILIKE ?';
            params.push(category);
            if (subcategory) {
                query += ' AND subcategory ILIKE ?';
                params.push(subcategory);
            }
        }

        console.log(`[API Products] Query: ${query} with params:`, params);
        const products = await db.query(query, params);
        console.log(`[API Products] Found ${products.length} products`);

        // Convert decimal strings to numbers for the frontend
        const formattedProducts = products.map((p: any) => ({
            ...p,
            price: Number(p.price)
        }));

        return NextResponse.json(formattedProducts);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
