const Database = require('better-sqlite3');
const db = new Database('traiteur.db');

const products = [
    { id: 1, name: 'Symphonie Océane', price: 280.00, quantity: 1 },
    { id: 2, name: 'L\'Apogée Terroir', price: 165.00, quantity: 1 },
    { id: 6, name: 'Coffret "Affaires" Premium', price: 45.00, quantity: 2 },
    { id: 8, name: 'Coffret Mer & Merveilles', price: 62.00, quantity: 1 },
    { id: 9, name: 'Bento Fusion', price: 38.00, quantity: 3 },
    { id: 10, name: 'Le "Parisien-Chic"', price: 24.00, quantity: 5 },
    { id: 11, name: 'Coffret Bien-Être', price: 32.00, quantity: 1 },
    { id: 12, name: 'Les Classiques', price: 42.00, quantity: 1 },
    { id: 13, name: 'Mini-Burgers', price: 48.00, quantity: 1 }
];

const total = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

try {
    const stmt = db.prepare('UPDATE orders SET items = ?, total = ? WHERE id = ?');
    const result = stmt.run(JSON.stringify(products), total, 'ORD-004');
    console.log(`Order ORD-004 updated successfully. Rows affected: ${result.changes}`);
} catch (err) {
    console.error('Error updating order:', err.message);
} finally {
    db.close();
}
