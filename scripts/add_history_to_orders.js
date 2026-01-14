const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

console.log('Adding history column to orders table in:', dbPath);

try {
  // Check if history column exists
  const tableInfo = db.pragma('table_info(orders)');
  const hasHistory = tableInfo.some(col => col.name === 'history');

  if (!hasHistory) {
    console.log('Adding history column...');
    db.exec(`ALTER TABLE orders ADD COLUMN history TEXT`);
    
    // Initialize history for existing orders
    const orders = db.prepare('SELECT id, createdAt FROM orders').all();
    
    const updateStmt = db.prepare('UPDATE orders SET history = ? WHERE id = ?');
    
    db.transaction(() => {
      for (const order of orders) {
        const initialHistory = [{
          status: 'pending_confirmation',
          date: order.createdAt,
          label: 'Commande créée'
        }];
        updateStmt.run(JSON.stringify(initialHistory), order.id);
      }
    })();
    
    console.log(`Updated ${orders.length} existing orders with initial history.`);
  } else {
    console.log('History column already exists.');
  }

  console.log('Migration completed successfully.');
} catch (error) {
  console.error('Migration failed:', error);
} finally {
  db.close();
}
