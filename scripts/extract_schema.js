const Database = require('better-sqlite3');
const db = new Database('traiteur.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('--- TABLES ---');
tables.forEach(table => {
    console.log(`\nTable: ${table.name}`);
    const schema = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${table.name}'`).get();
    console.log(schema.sql + ';');
});

const indexes = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='index'").all();
console.log('\n--- INDEXES ---');
indexes.forEach(index => {
    if (index.sql) {
        console.log(index.sql + ';');
    }
});
