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
        
        const cartItems = db.prepare(`
            SELECT 
                c.id,
                c.productId,
                c.quantity,
                p.name,
                p.price,
                p.image,
                p.category
            FROM cart c
            JOIN products p ON c.productId = p.id
            WHERE c.userId = ?
            ORDER BY c.createdAt ASC
        `).all(userId);

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
        const product = db.prepare('SELECT id, name, price, image, category FROM products WHERE id = ?').get(productId);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Check if item already exists in cart
        const existingItem = db.prepare('SELECT id, quantity FROM cart WHERE userId = ? AND productId = ?').get(userId, productId) as { id: string | number, quantity: number } | undefined;

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;
            db.prepare(`
                UPDATE cart 
                SET quantity = ?, updatedAt = datetime('now')
                WHERE id = ?
            `).run(newQuantity, existingItem.id);
        } else {
            // Insert new item
            db.prepare(`
                INSERT INTO cart (userId, productId, quantity)
                VALUES (?, ?, ?)
            `).run(userId, productId, quantity);
        }

        // Return updated cart
        const cartItems = db.prepare(`
            SELECT 
                c.id as cartId,
                c.productId,
                c.quantity,
                p.name,
                p.price,
                p.image,
                p.category
            FROM cart c
            JOIN products p ON c.productId = p.id
            WHERE c.userId = ?
            ORDER BY c.createdAt ASC
        `).all(userId);

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
            db.prepare('DELETE FROM cart WHERE userId = ? AND productId = ?').run(userId, productId);
        } else {
            // Update quantity
            db.prepare(`
                UPDATE cart 
                SET quantity = ?, updatedAt = datetime('now')
                WHERE userId = ? AND productId = ?
            `).run(quantity, userId, productId);
        }

        // Return updated cart
        const cartItems = db.prepare(`
            SELECT 
                c.id as cartId,
                c.productId,
                c.quantity,
                p.name,
                p.price,
                p.image,
                p.category
            FROM cart c
            JOIN products p ON c.productId = p.id
            WHERE c.userId = ?
            ORDER BY c.createdAt ASC
        `).all(userId);

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
            db.prepare('DELETE FROM cart WHERE userId = ? AND productId = ?').run(userId, productId);
        } else {
            // Clear entire cart
            db.prepare('DELETE FROM cart WHERE userId = ?').run(userId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting from cart:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
