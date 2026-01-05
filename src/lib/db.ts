import Database from 'better-sqlite3';
import path from 'path';

// Use a singleton pattern or global cache in development to avoid too many connections in Next.js hot reload
// However, better-sqlite3 is synchronous and file-based, usually fine. 
// Standard practice for Next.js with DB connections:
const dbPath = path.join(process.cwd(), 'traiteur.db');

declare global {
    var db: Database.Database | undefined;
}

let db: Database.Database;

// Singleton pattern pour éviter les multiples connexions
if (global.db) {
    db = global.db;
} else {
    try {
        db = new Database(dbPath);
        console.log('[DB] Connexion à la base de données réussie:', dbPath);
        
        // Activer WAL mode pour de meilleures performances en lecture/écriture concurrentes
        db.pragma('journal_mode = WAL');
        
        global.db = db;
    } catch (error) {
        console.error('[DB] Erreur de connexion à la base de données:', error);
        throw error;
    }
}

export default db;
