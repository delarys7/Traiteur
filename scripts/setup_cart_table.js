const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'traiteur.db');
const db = new Database(dbPath);

try {
    // Create cart table
    db.exec(`
        CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            productId INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            createdAt TEXT NOT NULL DEFAULT (datetime('now')),
            updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
            UNIQUE(userId, productId),
            FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
        )
    `);

    // Create index for faster lookups
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_cart_userId ON cart(userId)
    `);

    console.log('Cart table created successfully');
} catch (error) {
    console.error('Error creating cart table:', error);
} finally {
    db.close();
}
