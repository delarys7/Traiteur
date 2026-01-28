import { Pool, QueryResultRow, types } from 'pg';

// Forcer pg à parser les types NUMERIC/DECIMAL (OID 1700) en nombres au lieu de chaînes
types.setTypeParser(1700, (val) => parseFloat(val));

// Utilisation d'un pool de connexions pour PostgreSQL (Supabase)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.warn('[DB] AVERTISSEMENT : DATABASE_URL non définie. La base de données ne fonctionnera pas.');
}

declare global {
    var dbPool: Pool | undefined;
}

let pool: Pool;

if (global.dbPool) {
    pool = global.dbPool;
} else {
    const maskedUrl = connectionString ? connectionString.replace(/:[^:@]+@/, ':****@') : 'UNDEFINED';
    console.log(`[DB] Tentative de connexion avec DATABASE_URL: ${maskedUrl}`);
    
    pool = new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    pool.on('connect', (client) => {
        console.log('[DB] Nouvelle connexion au pool PostgreSQL établie');
    });

    pool.on('error', (err) => {
        console.error('[DB] Erreur inattendue sur un client PostgreSQL inactif', err);
    });

    global.dbPool = pool;
}

// Helper pour simplifier les requêtes et limiter les changements dans le code existant
// Note : Ces méthodes sont maintenant ASYNCHRONES, contrairement à better-sqlite3
const db = {
    // Équivalent de .prepare(sql).all(params)
    async query<T extends QueryResultRow>(sql: string, params: any[] = []): Promise<T[]> {
        // Conversion basique des placeholders ? vers $1, $2 (SQLite -> Postgres)
        let i = 1;
        const pgSql = sql.replace(/\?/g, () => `$${i++}`);
        console.log(`[DB Query] ${pgSql}`, params);
        try {
            const result = await pool.query<T>(pgSql, params);
            console.log(`[DB Success] ${result.rowCount} rows`);
            return result.rows;
        } catch (error) {
            console.error(`[DB Error] ${sql}`, error);
            throw error;
        }
    },

    // Équivalent de .prepare(sql).get(params)
    async get<T extends QueryResultRow>(sql: string, params: any[] = []): Promise<T | undefined> {
        const rows = await this.query<T>(sql, params);
        return rows[0];
    },

    // Équivalent de .prepare(sql).run(params)
    async run(sql: string, params: any[] = []): Promise<{ rowCount: number }> {
        let i = 1;
        const pgSql = sql.replace(/\?/g, () => `$${i++}`);
        console.log(`[DB Run] ${pgSql}`, params);
        try {
            const result = await pool.query(pgSql, params);
            console.log(`[DB Success] ${result.rowCount} rows affected`);
            return { rowCount: result.rowCount || 0 };
        } catch (error) {
            console.error(`[DB Error] ${sql}`, error);
            throw error;
        }
    },

    // Accès direct au pool si besoin
    pool
};

export default db;
export { pool };
