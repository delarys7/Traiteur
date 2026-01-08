const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

console.log('Creating contact_messages table in:', dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    entreprise TEXT,
    motif TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' = en attente de réponse, 'replied' = répondu, 'closed' = fermé
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_contact_messages_userId ON contact_messages(userId);
  CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
  CREATE INDEX IF NOT EXISTS idx_contact_messages_createdAt ON contact_messages(createdAt);
`);

console.log('Contact messages table created successfully.');
db.close();
