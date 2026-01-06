const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

console.log('Checking for allergies column in user table...');

try {
    const tableInfo = db.pragma('table_info(user)');
    const hasAllergies = tableInfo.some(col => col.name === 'allergies');

    if (!hasAllergies) {
        console.log('Adding allergies column...');
        db.prepare('ALTER TABLE user ADD COLUMN allergies TEXT').run();
        console.log('Allergies column added successfully.');
    } else {
        console.log('Allergies column already exists.');
    }
} catch (error) {
    console.error('Error running migration:', error);
}
