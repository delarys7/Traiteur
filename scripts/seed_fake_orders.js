const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

const userId = 'MGuViKWtaok6wtqQH7qqNTpouZmgnzVm'; // theo.michel2.tm@gmail.com

console.log('Seeding fake orders for user:', userId);

const orders = [
    {
        id: 'ORD-001',
        userId,
        type: 'product',
        status: 'pending_confirmation',
        total: 145.50,
        items: JSON.stringify([
            { id: 37, name: 'Symphonie Océane', price: 280.00, quantity: 1 }
        ]),
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'ORD-002',
        userId,
        type: 'product',
        status: 'validated',
        total: 88.00,
        items: JSON.stringify([
            { id: 81, name: 'Homard Excellence', price: 88.00, quantity: 1 }
        ]),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'ORD-003',
        userId,
        type: 'product',
        status: 'paid',
        total: 120.00,
        items: JSON.stringify([
            { id: 79, name: 'Le Caviar & Vodka', price: 120.00, quantity: 1 }
        ]),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'ORD-004',
        userId,
        type: 'product',
        status: 'received',
        total: 62.00,
        items: JSON.stringify([
            { id: 49, name: 'Coffret Mer & Merveilles', price: 62.00, quantity: 1 }
        ]),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'ORD-005',
        userId,
        type: 'product',
        status: 'refused',
        total: 320.00,
        refusalReason: 'Indisponibilité du Chef aux dates demandées.',
        items: JSON.stringify([
            { id: 41, name: 'Le Grand Dîner', price: 320.00, quantity: 1 }
        ]),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
];

try {
    const insert = db.prepare(`
        INSERT INTO orders (id, userId, type, status, total, items, refusalReason, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const order of orders) {
        try {
            insert.run(
                order.id,
                order.userId,
                order.type,
                order.status,
                order.total,
                order.items,
                order.refusalReason || null,
                order.createdAt,
                order.createdAt
            );
            console.log(`Inserted order ${order.id}`);
        } catch (e) {
            console.log(`Order ${order.id} might already exist or error: ${e.message}`);
        }
    }
    console.log('Seeding successful.');
} catch (error) {
    console.error('Error during seeding:', error);
} finally {
    db.close();
}
