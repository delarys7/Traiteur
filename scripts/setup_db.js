/* eslint-disable */
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

console.log('Mass populating database at:', dbPath);

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

  -- ==========================================
  -- BUFFETS
  -- ==========================================
  INSERT INTO products (name, description, price, category, subcategory, image) VALUES 
  ('Symphonie Océane', 'Plateau de fruits de mer royal: homard bleu, huîtres Gillardeau n°2, langoustines royales et caviar Osciètre (30g). Accompagné de pain de seigle et beurre Bordier.', 280.00, 'buffet', NULL, '/images/buffet_hero.jpg'),
  ('L''Apogée Terroir', 'Buffet campagnard chic: Foie gras de canard mi-cuit, jambon Pata Negra Bellota, fromages affinés par notre Maître Fromager, pains artisanaux.', 190.00, 'buffet', NULL, '/images/hero.jpg'),
  ('Le Brunch Impérial', 'Assortiment de viennoiseries, saumon fumé d''Écosse, œufs brouillés à la truffe, salade de fruits exotiques, jus detox pressés à froid.', 145.00, 'buffet', NULL, '/images/dessert_hero.jpg'),
  ('Soirée Toscane', 'Antipasti de légumes grillés, charcuteries italiennes fines, burrata crémeuse des Pouilles, focaccia au romarin.', 160.00, 'buffet', NULL, '/images/main_hero.jpg'),
  ('Le Grand Dîner', 'Pièce de bœuf Wagyu rôti, gratin dauphinois à la crème double, poêlée de cèpes, sélection de desserts du chef.', 320.00, 'buffet', NULL, '/images/chef_hero.jpg');

  -- ==========================================
  -- PLATEAUX REPAS
  -- ==========================================
  INSERT INTO products (name, description, price, category, subcategory, image) VALUES 
  ('Coffret "Affaires" Premium', 'Saumon Gravlax à l''aneth, suprême de volaille fermière aux morilles, écrasé de pommes de terre à la truffe, tartelette citron meringuée.', 55.00, 'plateau', NULL, '/images/chef_hero.jpg'),
  ('Coffret Végétal', 'Carpaccio de betteraves colorées, risotto d''épeautre aux légumes oubliés, sélection de fromages, entremets chocolat-poire.', 45.00, 'plateau', NULL, '/images/hero.jpg'),
  ('Coffret Mer & Merveilles', 'Dos de cabillaud skrei, mousseline de patate douce, légumes glacés, pavlova aux fruits rouges.', 62.00, 'plateau', NULL, '/images/buffet_hero.jpg'),
  ('Bento Fusion', 'Tataki de thon rouge, salade d''algues wakame, riz vinaigré au sésame, mochis glacés artisanaux.', 58.00, 'plateau', NULL, '/images/cocktail_hero.jpg'),
  ('Le "Parisien-Chic"', 'Sandwich baguette tradition au jambon truffé, comté 24 mois, petite salade de mâche, éclair au chocolat grand cru.', 38.00, 'plateau', NULL, '/images/main_hero.jpg'),
  ('Coffret Bien-Être', 'Poke bowl au saumon mariné, avocat, mangue, quinoa rouge, smoothie vert, salade de fruits frais.', 48.00, 'plateau', NULL, '/images/dessert_hero.jpg');

  -- ==========================================
  -- PIÈCES COCKTAILS - STANDARD
  -- ==========================================
  INSERT INTO products (name, description, price, category, subcategory, image) VALUES 
  ('Les Classiques', 'Assortiment de 12 pièces: Navette briochée au crabe, gougère au Comté, wrap saumon fumé.', 35.00, 'cocktail', 'standard', '/images/cocktail_hero.jpg'),
  ('Mini-Burgers', 'Plateau de 12 mini-cheeseburgers: Bœuf charolais, cheddar affiné, sauce maison.', 38.00, 'cocktail', 'standard', '/images/main_hero.jpg'),
  ('Verrines Fraîcheur', 'Assortiment de 12 verrines: Gaspacho andalou, tartare de concombre à la menthe.', 32.00, 'cocktail', 'standard', '/images/hero.jpg'),
  ('Brochettes Soleil', '12 brochettes: Mozzarella-Tomate cerise, Melon-Jambon cru, Poulet-Ananas.', 34.00, 'cocktail', 'standard', '/images/buffet_hero.jpg'),
  ('Délices Fromagers', '12 pièces: Sablé au parmesan, chou au roquefort, roulé au chèvre frais.', 36.00, 'cocktail', 'standard', '/images/dessert_hero.jpg');

  -- ==========================================
  -- PIÈCES COCKTAILS - PREMIUM
  -- ==========================================
  INSERT INTO products (name, description, price, category, subcategory, image) VALUES 
  ('Collection Signature', 'Assortiment de 12 pièces: Opéra de foie gras, macaron chèvre-figue, gambas en tempura.', 55.00, 'cocktail', 'premium', '/images/cocktail_hero.jpg'),
  ('Saveurs d''Orient', '12 pièces: Falafels au sésame, keftas d''agneau à la menthe, briouates au fromage.', 52.00, 'cocktail', 'premium', '/images/main_hero.jpg'),
  ('Mignardises Sucrées', '12 pièces douces: Mini-éclairs, tartelettes aux framboises, choux pralinés.', 48.00, 'cocktail', 'premium', '/images/dessert_hero.jpg'),
  ('Terre & Mer', '12 pièces: Roulé de bœuf au pesto, tartare de Saint-Jacques, blinis au saumon.', 58.00, 'cocktail', 'premium', '/images/hero.jpg'),
  ('Atelier Bruschetta', 'Assortiment de 12 bruschettas gourmandes: Tomate-Basilic, Truffe-Ricotta, Courgette-Menthe.', 45.00, 'cocktail', 'premium', '/images/buffet_hero.jpg');

  -- ==========================================
  -- PIÈCES COCKTAILS - DELUXE
  -- ==========================================
  INSERT INTO products (name, description, price, category, subcategory, image) VALUES 
  ('Écrin Deluxe', 'Assortiment de 12 pièces d''exception: Blinis au Caviar Baeri, carpaccio de Saint-Jacques à la truffe, homard en gelée d''agrumes, or comestible.', 95.00, 'cocktail', 'deluxe', '/images/cocktail_hero.jpg'),
  ('Le Caviar & Vodka', 'Dégustation prestige: 30g de Caviar Osciètre, blinis tièdes, crème d''Isigny, shot de Vodka Beluga (10cl).', 120.00, 'cocktail', 'deluxe', '/images/hero.jpg'),
  ('Folie Truffée', 'Tout à la truffe noire (Tuber Melanosporum): 12 pièces incluant brouillade, croque-monsieur truffé, macaron truffe blanche.', 85.00, 'cocktail', 'deluxe', '/images/main_hero.jpg'),
  ('Homard Excellence', 'Déclinaison autour du homard bleu: 8 pièces (Raviole, Mini-sandwich, Bisque crèmeuse).', 88.00, 'cocktail', 'deluxe', '/images/buffet_hero.jpg'),
  ('Orfèvrerie Sucrée', '12 bijoux sucrés: Dôme or-chocolat, religieuse à la rose, calisson revisité.', 75.00, 'cocktail', 'deluxe', '/images/dessert_hero.jpg');
`);

console.log('Database mass population complete.');
