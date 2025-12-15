/* eslint-disable */
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

console.log('Re-initializing database with rich content at:', dbPath);

db.exec(`
  DROP TABLE IF EXISTS products;
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    category TEXT,
    subcategory TEXT,
    image TEXT
  );

  -- Keep users table intact
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT
  );

  -- Seed data with Luxury Content
  INSERT INTO products (name, description, price, category, subcategory, image) VALUES 
  ('Symphonie Océane', 'Plateau de fruits de mer royal: homard bleu, huîtres Gillardeau n°2, langoustines royales et caviar Osciètre (30g). Accompagné de pain de seigle et beurre Bordier.', 280.00, 'buffet', NULL, '/images/buffet_hero.jpg'),
  ('L''Apogée Terroir', 'Buffet campagnard chic: Foie gras de canard mi-cuit, jambon Pata Negra Bellota, fromages affinés par notre Maître Fromager, pains artisanaux.', 190.00, 'buffet', NULL, '/images/hero.jpg'),
  
  (' coffret "Affaires" Premium', 'Saumon Gravlax à l''aneth, suprême de volaille fermière aux morilles, écrasé de pommes de terre à la truffe, tartelette citron meringuée.', 55.00, 'plateau', NULL, '/images/chef_hero.jpg'),
  ('Coffret Végétal', 'Carpaccio de betteraves colorées, risotto d''épeautre aux légumes oubliés, sélection de fromages, entremets chocolat-poire.', 45.00, 'plateau', NULL, '/images/hero.jpg'),
  
  ('Les Classiques', 'Assortiment de 12 pièces: Navette briochée au crabe, gougère au Comté, wrap saumon fumé.', 35.00, 'cocktail', 'standard', '/images/cocktail_hero.jpg'),
  ('Collection Signature', 'Assortiment de 12 pièces: Opéra de foie gras, macaron chèvre-figue, gambas en tempura.', 55.00, 'cocktail', 'premium', '/images/cocktail_hero.jpg'),
  ('Écrin Deluxe', 'Assortiment de 12 pièces d''exception: Blinis au Caviar Baeri, carpaccio de Saint-Jacques à la truffe, homard en gelée d''agrumes, or comestible.', 95.00, 'cocktail', 'deluxe', '/images/cocktail_hero.jpg');
`);

console.log('Database re-seeded successfully.');
