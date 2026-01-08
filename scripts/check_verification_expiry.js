const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

console.log('=== Tokens de vérification dans la base de données ===\n');

try {
    // Récupérer tous les tokens de vérification
    const verifications = db.prepare(`
        SELECT 
            id,
            identifier,
            value,
            expiresAt,
            createdAt,
            datetime('now') as now
        FROM verification
        ORDER BY createdAt DESC
        LIMIT 10
    `).all();
    
    if (verifications.length === 0) {
        console.log('Aucun token de vérification trouvé dans la base de données.\n');
    } else {
        console.log(`Total: ${verifications.length} token(s) trouvé(s)\n`);
        
        verifications.forEach((v, index) => {
            const createdAt = new Date(v.createdAt);
            const expiresAt = new Date(v.expiresAt);
            const now = new Date(v.now);
            
            // Calculer la durée de validité en heures
            const durationMs = expiresAt.getTime() - createdAt.getTime();
            const durationHours = durationMs / (1000 * 60 * 60);
            const durationDays = durationHours / 24;
            
            // Vérifier si le token est expiré
            const isExpired = expiresAt < now;
            const timeRemaining = isExpired 
                ? 'EXPIRÉ' 
                : `${Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60))} heures restantes`;
            
            console.log(`Token ${index + 1}:`);
            console.log(`  Email: ${v.identifier}`);
            console.log(`  Créé le: ${createdAt.toLocaleString('fr-FR')}`);
            console.log(`  Expire le: ${expiresAt.toLocaleString('fr-FR')}`);
            console.log(`  Durée de validité: ${durationHours.toFixed(1)} heures (${durationDays.toFixed(2)} jours)`);
            console.log(`  Statut: ${isExpired ? '❌ EXPIRÉ' : '✅ VALIDE'} - ${timeRemaining}`);
            console.log(`  Token (premiers caractères): ${v.value.substring(0, 16)}...`);
            console.log('');
        });
        
        // Calculer la durée moyenne
        if (verifications.length > 0) {
            const avgDuration = verifications.reduce((sum, v) => {
                const createdAt = new Date(v.createdAt);
                const expiresAt = new Date(v.expiresAt);
                return sum + (expiresAt.getTime() - createdAt.getTime());
            }, 0) / verifications.length;
            
            const avgHours = avgDuration / (1000 * 60 * 60);
            const avgDays = avgHours / 24;
            
            console.log(`\n📊 Durée moyenne de validité: ${avgHours.toFixed(1)} heures (${avgDays.toFixed(2)} jours)`);
        }
    }
    
    // Vérifier s'il y a des tokens expirés
    const expiredCount = db.prepare(`
        SELECT COUNT(*) as count 
        FROM verification 
        WHERE expiresAt < datetime('now')
    `).get();
    
    const validCount = db.prepare(`
        SELECT COUNT(*) as count 
        FROM verification 
        WHERE expiresAt >= datetime('now')
    `).get();
    
    console.log(`\n📈 Statistiques:`);
    console.log(`  Tokens valides: ${validCount.count}`);
    console.log(`  Tokens expirés: ${expiredCount.count}`);
    
} catch (error) {
    console.error('Erreur:', error.message);
} finally {
    db.close();
}
