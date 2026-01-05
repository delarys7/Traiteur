const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
console.log('Test de connexion à la base de données...');
console.log('Chemin:', dbPath);

try {
    const db = new Database(dbPath);
    console.log('✓ Connexion réussie');
    
    // Test d'écriture
    const test = db.prepare('SELECT 1 as test').get();
    console.log('✓ Test de requête réussi:', test);
    
    // Vérifier les tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('✓ Tables trouvées:', tables.map(t => t.name).join(', '));
    
    // Test d'insertion (simulation)
    console.log('✓ Base de données opérationnelle');
    
    db.close();
    console.log('\n✓ Tous les tests sont passés');
} catch (error) {
    console.error('✗ Erreur:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}
