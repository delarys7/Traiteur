const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'traiteur.db');
const db = new Database(dbPath);

console.log('Fixing reviews table schema...');

try {
    // 1. Sauvegarder les données existantes (au cas où)
    const existingReviews = db.prepare('SELECT * FROM reviews').all();
    console.log(`Found ${existingReviews.length} existing reviews.`);

    // 2. Supprimer l'ancienne table
    db.prepare('DROP TABLE reviews').run();

    // 3. Recréer la table avec les bonnes colonnes et contraintes
    db.prepare(`
        CREATE TABLE reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            productId INTEGER NOT NULL, -- -1 pour les avis sur la commande globale
            userId TEXT NOT NULL,
            orderId TEXT,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            isOrderReview INTEGER DEFAULT 0,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
            UNIQUE(productId, userId, orderId) -- Permet un avis par produit par commande, et un avis global par commande
        )
    `).run();

    console.log('Reviews table recreated successfully with updated constraints.');

} catch (error) {
    console.error('Error fixing reviews table:', error);
} finally {
    db.close();
}
