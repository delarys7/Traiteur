import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
    const results: any = {
        db: 'unknown',
        userTable: 'unknown',
        cartTable: 'unknown',
        session: 'unknown',
        errors: []
    };

    try {
        // Test 1: Simple query
        const dbTest = await db.query('SELECT NOW()');
        results.db = 'ok';
    } catch (e: any) {
        results.db = 'error';
        results.errors.push(`DB: ${e.message}`);
    }

    try {
        // Test 2: Check "user" table (reserved keyword test)
        const userTest = await db.query('SELECT count(*) FROM "user"');
        results.userTable = 'ok';
    } catch (e: any) {
        results.userTable = 'error';
        results.errors.push(`User Table: ${e.message}`);
    }

    try {
        // Test 3: Check "cart" table
        const cartTest = await db.query('SELECT count(*) FROM cart');
        results.cartTable = 'ok';
    } catch (e: any) {
        results.cartTable = 'error';
        results.errors.push(`Cart Table: ${e.message}`);
    }

    return NextResponse.json(results);
}
