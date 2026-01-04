const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables found:', tables.map(t => t.name).join(', '));

const requiredTables = ['user', 'session', 'account', 'verification'];
const missing = requiredTables.filter(t => !tables.find(found => found.name === t));

if (missing.length === 0) {
    console.log('All required Better Auth tables are present.');
} else {
    console.log('Missing tables:', missing.join(', '));
}
