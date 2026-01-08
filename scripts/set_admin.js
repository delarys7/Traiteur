const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

// Récupérer l'email depuis les arguments de ligne de commande
const email = process.argv[2];

if (!email) {
    console.error('Usage: node scripts/set_admin.js <email>');
    console.error('Example: node scripts/set_admin.js admin@example.com');
    process.exit(1);
}

try {
    // Vérifier si l'utilisateur existe
    const user = db.prepare('SELECT * FROM user WHERE email = ?').get(email);

    if (!user) {
        console.error(`❌ Utilisateur avec l'email "${email}" introuvable.`);
        process.exit(1);
    }

    // Mettre à jour le type de l'utilisateur à 'administrateur'
    db.prepare(`
        UPDATE user 
        SET type = 'administrateur', updatedAt = datetime('now')
        WHERE email = ?
    `).run(email);

    console.log(`✅ L'utilisateur "${email}" a été défini comme administrateur.`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Nom: ${user.name || 'N/A'}`);
    console.log(`   Type: administrateur`);
} catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
} finally {
    db.close();
}
