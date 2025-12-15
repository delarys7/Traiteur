import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const stmt = db.prepare('SELECT id, name, email FROM users WHERE email = ? AND password = ?');
        const user = stmt.get(email, password);

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // In a real app, set an HTTP-only cookie with a JWT here.
        // For this prototype, we'll return the user object and store it in Context/LocalStorage.

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
