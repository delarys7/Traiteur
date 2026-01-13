/* eslint-disable */
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'traiteur.db');
const db = new Database(dbPath);

console.log('Creating reviews table in:', dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    userId TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
    UNIQUE(productId, userId)
  );

  CREATE INDEX IF NOT EXISTS idx_reviews_productId ON reviews(productId);
  CREATE INDEX IF NOT EXISTS idx_reviews_userId ON reviews(userId);
  CREATE INDEX IF NOT EXISTS idx_reviews_createdAt ON reviews(createdAt);
`);

console.log('Reviews table created successfully.');
db.close();
