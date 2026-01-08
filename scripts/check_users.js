const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

console.log('=== Utilisateurs dans la base de données ===\n');

try {
    const users = db.prepare('SELECT id, email, firstName, lastName, type FROM user').all();
    
    console.log(`Total: ${users.length} utilisateur(s)\n`);
    
    users.forEach(u => {
        console.log(`Email: ${u.email}`);
        console.log(`  Nom: ${u.firstName || ''} ${u.lastName || ''}`);
        console.log(`  Type: ${u.type || 'NULL'}`);
        console.log(`  ID: ${u.id}`);
        console.log('');
    });
    
    const nonAdminUsers = db.prepare(`
        SELECT COUNT(*) as count 
        FROM user 
        WHERE type != 'administrateur' OR type IS NULL
    `).get();
    
    console.log(`\nUtilisateurs non-admin: ${nonAdminUsers.count}`);
} catch (error) {
    console.error('Erreur:', error.message);
} finally {
    db.close();
}
