const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('traiteur.db');

const products = db.prepare("SELECT * FROM products").all();

let sql = "-- SQL Script to migrate products to Supabase\n";
sql += "INSERT INTO products (id, name, description, price, category, subcategory, image, cuisine, dietary, allergies) VALUES\n";

const values = products.map(p => {
    return `(${p.id}, ${escapeSql(p.name)}, ${escapeSql(p.description)}, ${p.price}, ${escapeSql(p.category)}, ${escapeSql(p.subcategory)}, ${escapeSql(p.image)}, ${escapeSql(p.cuisine)}, ${escapeSql(p.dietary)}, ${escapeSql(p.allergies)})`;
}).join(',\n');

sql += values + ";\n";
sql += "\n-- Resetting the sequence for the id column\n";
sql += "SELECT setval(pg_get_serial_sequence('products', 'id'), coalesce(max(id), 0) + 1, false) FROM products;\n";

fs.writeFileSync('migrate_products.sql', sql);

function escapeSql(val) {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    return "'" + val.toString().replace(/'/g, "''") + "'";
}

console.log('migrate_products.sql generated successfully.');
