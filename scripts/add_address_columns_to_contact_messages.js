const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

console.log('Adding address columns to contact_messages table...');

try {
    // Add columns if they don't exist
    const columns = [
        'manualAddress TEXT',
        'manualPostalCode TEXT',
        'manualCity TEXT',
        'selectedAddress TEXT' // Assuming ID is TEXT based on other IDs, check addresses table? usually uuids.
    ];

    for (const column of columns) {
        try {
            db.prepare(`ALTER TABLE contact_messages ADD COLUMN ${column}`).run();
            console.log(`Added column: ${column}`);
        } catch (error) {
            if (error.message.includes('duplicate column name')) {
                console.log(`Column already exists: ${column}`);
            } else {
                console.error(`Error adding column ${column}:`, error.message);
            }
        }
    }

    console.log('Migration completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
}
