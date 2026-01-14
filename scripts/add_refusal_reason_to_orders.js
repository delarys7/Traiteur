const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

console.log('Adding refusalReason column to orders table...');

try {
    // Vérifier si la colonne existe déjà
    const tableInfo = db.prepare("PRAGMA table_info(orders)").all();
    const hasRefusalReason = tableInfo.some(col => col.name === 'refusalReason');

    if (!hasRefusalReason) {
        db.exec(`
            ALTER TABLE orders ADD COLUMN refusalReason TEXT;
        `);
        console.log('Column refusalReason added successfully.');
    } else {
        console.log('Column refusalReason already exists.');
    }
} catch (error) {
    console.error('Error:', error);
} finally {
    db.close();
}
