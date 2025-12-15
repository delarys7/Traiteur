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
            query += ' WHERE category = ?';
            params.push(category);
            if (subcategory) {
                query += ' AND subcategory = ?';
                params.push(subcategory);
            }
        }

        const stmt = db.prepare(query);
        const products = stmt.all(...params);

        return NextResponse.json(products);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
