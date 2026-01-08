const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

console.log('Creating orders table in:', dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'product' pour commande de produits, 'service' pour demande de prestation
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    total REAL NOT NULL,
    items TEXT, -- JSON string pour les produits commandés
    serviceType TEXT, -- Type de prestation si type='service' (commande, collaboration, prestation-domicile, consulting, etc.)
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_orders_userId ON orders(userId);
  CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON orders(createdAt);
`);

console.log('Orders table created successfully.');
db.close();
