const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

console.log('Migrating orders and reviews tables...');

try {
    // 1. Update orders table
    const ordersInfo = db.pragma('table_info(orders)');
    const hasRefusalReason = ordersInfo.some(col => col.name === 'refusalReason');

    if (!hasRefusalReason) {
        console.log('Adding refusalReason column to orders...');
        db.prepare('ALTER TABLE orders ADD COLUMN refusalReason TEXT').run();
    }

    // 2. Update reviews table
    const reviewsInfo = db.pragma('table_info(reviews)');
    const hasOrderId = reviewsInfo.some(col => col.name === 'orderId');
    const hasIsOrderReview = reviewsInfo.some(col => col.name === 'isOrderReview');

    if (!hasOrderId) {
        console.log('Adding orderId column to reviews...');
        db.prepare('ALTER TABLE reviews ADD COLUMN orderId TEXT').run();
    }

    if (!hasIsOrderReview) {
        console.log('Adding isOrderReview column to reviews...');
        db.prepare('ALTER TABLE reviews ADD COLUMN isOrderReview INTEGER DEFAULT 0').run();
    }

    // Make productId nullable if it's not already
    // In SQLite, you can't easily change a column to nullable. 
    // But our setup_reviews_table.js already had productId as INTEGER NOT NULL.
    // However, for General Order Review, we might want it to be NULL.
    // Since Alter Table is limited, we might need a workaround or just store a special value like -1.
    // Let's check if we can recreate the table if needed, or if we can just keep productId and use -1.
    // Actually, SQLite doesn't enforce FKs by default unless requested.
    
    console.log('Migration successful.');
} catch (error) {
    console.error('Error during migration:', error);
} finally {
    db.close();
}
