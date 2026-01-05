const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

const email = process.argv[2];

if (!email) {
    console.log('Usage: node scripts/delete_user.js email@exemple.com');
    process.exit(1);
}

try {
    // Supprimer les sessions liées d'abord (intégrité référentielle)
    const user = db.prepare('SELECT id FROM user WHERE email = ?').get(email);
    
    if (user) {
        db.prepare('DELETE FROM session WHERE userId = ?').run(user.id);
        db.prepare('DELETE FROM account WHERE userId = ?').run(user.id);
        db.prepare('DELETE FROM user WHERE id = ?').run(user.id);
        db.prepare('DELETE FROM verification WHERE identifier = ?').run(email);
        
        console.log(`L'utilisateur ${email} et ses données liées ont été supprimés avec succès.`);
    } else {
        console.log(`Aucun utilisateur trouvé avec l'email : ${email}`);
    }
} catch (error) {
    console.error('Erreur lors de la suppression :', error.message);
}
