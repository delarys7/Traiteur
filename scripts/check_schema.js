const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

console.log('Inspecting table info for "users":');
const info = db.prepare("PRAGMA table_info(users)").all();
console.log(JSON.stringify(info, null, 2));
