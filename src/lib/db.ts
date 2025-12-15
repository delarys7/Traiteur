import Database from 'better-sqlite3';
import path from 'path';

// Use a singleton pattern or global cache in development to avoid too many connections in Next.js hot reload
// However, better-sqlite3 is synchronous and file-based, usually fine. 
// Standard practice for Next.js with DB connections:
const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

export default db;
