const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

console.log('=== Test de la base de données ===');
console.log('Chemin:', dbPath);

// Vérifier les tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('\nTables trouvées:', tables.map(t => t.name).join(', '));

// Vérifier les utilisateurs
try {
    const users = db.prepare('SELECT id, email, name, emailVerified FROM user LIMIT 5').all();
    console.log('\nUtilisateurs dans la base:');
    users.forEach(u => {
        console.log(`  - ${u.email} (${u.name}) - Vérifié: ${u.emailVerified}`);
    });
} catch (err) {
    console.error('Erreur lors de la lecture des utilisateurs:', err.message);
}

// Vérifier la structure de la table user
try {
    const userColumns = db.prepare("PRAGMA table_info(user)").all();
    console.log('\nColonnes de la table user:');
    userColumns.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
    });
} catch (err) {
    console.error('Erreur lors de la lecture de la structure:', err.message);
}

db.close();
console.log('\n=== Test terminé ===');
