import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Check if user exists
        const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
        const existingUser = checkStmt.get(email);

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        // Insert user (In production, hash password!)
        const insertStmt = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
        const info = insertStmt.run(email, password, name);

        return NextResponse.json({ success: true, userId: info.lastInsertRowid });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
