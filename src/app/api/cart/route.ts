import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        
        const cartItems = await db.query(`
            SELECT 
                c.id,
                c."productId",
                c.quantity,
                p.name,
                p.price,
                p.image,
                p.category
            FROM cart c
            JOIN products p ON c."productId" = p.id
            WHERE c."userId" = ?
            ORDER BY c."createdAt" ASC
        `, [userId]);

        return NextResponse.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { productId, quantity = 1 } = body;

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        // Check if product exists
        const product = await db.get('SELECT id, name, price, image, category FROM products WHERE id = ?', [productId]);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Check if item already exists in cart
        const existingItem = await db.get<{ id: string | number, quantity: number }>('SELECT id, quantity FROM cart WHERE "userId" = ? AND "productId" = ?', [userId, productId]);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            await db.run(`
                UPDATE cart 
                SET quantity = ?, "updatedAt" = NOW()
                WHERE id = ?
            `, [newQuantity, existingItem.id]);
        } else {
            // Insert new item
            await db.run(`
                INSERT INTO cart ("userId", "productId", quantity)
                VALUES (?, ?, ?)
            `, [userId, productId, quantity]);
        }

        // Return updated cart
        const cartItems = await db.query(`
            SELECT 
                c.id as "cartId",
                c."productId",
                c.quantity,
                p.name,
                p.price,
                p.image,
                p.category
            FROM cart c
            JOIN products p ON c."productId" = p.id
            WHERE c."userId" = ?
            ORDER BY c."createdAt" ASC
        `, [userId]);

        return NextResponse.json(cartItems);
    } catch (error) {
        console.error('Error adding to cart:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { productId, quantity } = body;

        if (!productId || quantity === undefined) {
            return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 });
        }

        if (quantity < 1) {
            // Remove item if quantity is 0 or less
            await db.run('DELETE FROM cart WHERE "userId" = ? AND "productId" = ?', [userId, productId]);
        } else {
            // Update quantity
            await db.run(`
                UPDATE cart 
                SET quantity = ?, "updatedAt" = NOW()
                WHERE "userId" = ? AND "productId" = ?
            `, [quantity, userId, productId]);
        }

        // Return updated cart
        const cartItems = await db.query(`
            SELECT 
                c.id as "cartId",
                c."productId",
                c.quantity,
                p.name,
                p.price,
                p.image,
                p.category
            FROM cart c
            JOIN products p ON c."productId" = p.id
            WHERE c."userId" = ?
            ORDER BY c."createdAt" ASC
        `, [userId]);

        return NextResponse.json(cartItems);
    } catch (error) {
        console.error('Error updating cart:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/cart - Remove item from cart or clear entire cart
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (productId) {
            // Remove specific item
            await db.run('DELETE FROM cart WHERE "userId" = ? AND "productId" = ?', [userId, productId]);
        } else {
            // Clear entire cart
            await db.run('DELETE FROM cart WHERE "userId" = ?', [userId]);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting from cart:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
