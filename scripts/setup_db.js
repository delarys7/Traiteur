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
    image TEXT,
    cuisine TEXT,
    dietary TEXT,
    allergies TEXT
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
  INSERT INTO products (name, description, price, category, subcategory, image, cuisine, dietary, allergies) VALUES 
  ('Symphonie Océane', 'Plateau de fruits de mer royal: homard bleu, huîtres Gillardeau n°2, langoustines royales et caviar Osciètre (30g).', 280.00, 'buffet', NULL, '/images/buffet_hero.jpg', 'française', 'poisson', 'crustacés'),
  ('L''Apogée Terroir', 'Buffet campagnard chic: Foie gras de canard mi-cuit, jambon Pata Negra Bellota, fromages affinés.', 190.00, 'buffet', NULL, '/images/hero.jpg', 'française,espagnole', 'carnivore', 'lactose'),
  ('Le Brunch Impérial', 'Assortiment de viennoiseries, saumon fumé d''Écosse, œufs brouillés à la truffe, salade de fruits exotiques.', 145.00, 'buffet', NULL, '/images/dessert_hero.jpg', 'française', 'végétarien,poisson', 'gluten,lactose'),
  ('Soirée Toscane', 'Antipasti de légumes grillés, charcuteries italiennes fines, burrata crémeuse des Pouilles, focaccia au romarin.', 160.00, 'buffet', NULL, '/images/main_hero.jpg', 'italienne', 'carnivore,végétarien', 'lactose,gluten'),
  ('Le Grand Dîner', 'Pièce de bœuf Wagyu rôti, gratin dauphinois à la crème double, poêlée de cèpes, sélection de desserts du chef.', 320.00, 'buffet', NULL, '/images/chef_hero.jpg', 'française,japonaise', 'carnivore', 'lactose');

  -- ==========================================
  -- PLATEAUX REPAS
  -- ==========================================
  INSERT INTO products (name, description, price, category, subcategory, image, cuisine, dietary, allergies) VALUES 
  ('Coffret "Affaires" Premium', 'Saumon Gravlax à l''aneth, suprême de volaille fermière aux morilles, écrasé de pommes de terre.', 55.00, 'plateau', NULL, '/images/chef_hero.jpg', 'française', 'carnivore,poisson', 'lactose'),
  ('Coffret Végétal', 'Carpaccio de betteraves colorées, risotto d''épeautre aux légumes oubliés, sélection de fromages.', 45.00, 'plateau', NULL, '/images/hero.jpg', 'française', 'végétarien,végétalien', 'gluten'),
  ('Coffret Mer & Merveilles', 'Dos de cabillaud skrei, mousseline de patate douce, légumes glacés, pavlova aux fruits rouges.', 62.00, 'plateau', NULL, '/images/buffet_hero.jpg', 'française', 'poisson', 'lactose'),
  ('Bento Fusion', 'Tataki de thon rouge, salade d''algues wakame, riz vinaigré au sésame, mochis glacés artisanaux.', 58.00, 'plateau', NULL, '/images/cocktail_hero.jpg', 'japonaise', 'poisson', 'gluten,sésame'),
  ('Le "Parisien-Chic"', 'Sandwich baguette tradition au jambon truffé, comté 24 mois, petite salade de mâche.', 38.00, 'plateau', NULL, '/images/main_hero.jpg', 'française', 'carnivore', 'gluten,lactose'),
  ('Coffret Bien-Être', 'Poke bowl au saumon mariné, avocat, mangue, quinoa rouge, smoothie vert, salade de fruits frais.', 48.00, 'plateau', NULL, '/images/dessert_hero.jpg', 'japonaise,mexicaine', 'végétarien,poisson', 'aucune');

  -- ==========================================
  -- PIÈCES COCKTAILS - STANDARD
  -- ==========================================
  INSERT INTO products (name, description, price, category, subcategory, image, cuisine, dietary, allergies) VALUES 
  ('Les Classiques', 'Navette briochée au crabe, gougère au Comté, wrap saumon fumé.', 35.00, 'cocktail', 'standard', '/images/cocktail_hero.jpg', 'française', 'poisson,carnivore', 'gluten,lactose,crustacés'),
  ('Mini-Burgers', 'Plateau de 12 mini-cheeseburgers: Bœuf charolais, cheddar affiné, sauce maison.', 38.00, 'cocktail', 'standard', '/images/main_hero.jpg', 'américaine', 'carnivore', 'gluten,lactose'),
  ('Verrines Fraîcheur', 'Assortiment de 12 verrines: Gaspacho andalou, tartare de concombre à la menthe.', 32.00, 'cocktail', 'standard', '/images/hero.jpg', 'espagnole', 'végétalien,vegan,végétarien', 'aucune'),
  ('Brochettes Soleil', '12 brochettes: Mozzarella-Tomate cerise, Melon-Jambon cru, Poulet-Ananas.', 34.00, 'cocktail', 'standard', '/images/buffet_hero.jpg', 'italienne,française', 'carnivore,végétarien', 'lactose'),
  ('Délices Fromagers', '12 pièces: Sablé au parmesan, chou au roquefort, roulé au chèvre frais.', 36.00, 'cocktail', 'standard', '/images/dessert_hero.jpg', 'française', 'végétarien', 'lactose,gluten');

  -- ==========================================
  -- PIÈCES COCKTAILS - PREMIUM
  -- ==========================================
  INSERT INTO products (name, description, price, category, subcategory, image, cuisine, dietary, allergies) VALUES 
  ('Collection Signature', 'Opéra de foie gras, macaron chèvre-figue, gambas en tempura.', 55.00, 'cocktail', 'premium', '/images/cocktail_hero.jpg', 'française,japonaise', 'carnivore,poisson', 'lactose,gluten,crustacés'),
  ('Saveurs d''Orient', '12 pièces: Falafels au sésame, keftas d''agneau à la menthe, briouates au fromage.', 52.00, 'cocktail', 'premium', '/images/main_hero.jpg', 'libanaise,marocaine', 'végétarien,carnivore', 'sésame,lactose,gluten'),
  ('Mignardises Sucrées', '12 pièces douces: Mini-éclairs, tartelettes aux framboises, choux pralinés.', 48.00, 'cocktail', 'premium', '/images/dessert_hero.jpg', 'française', 'végétarien', 'gluten,lactose'),
  ('Terre & Mer', '12 pièces: Roulé de bœuf au pesto, tartare de Saint-Jacques, blinis au saumon.', 58.00, 'cocktail', 'premium', '/images/hero.jpg', 'française', 'carnivore,poisson', 'lactose,gluten'),
  ('Atelier Bruschetta', 'Tomate-Basilic, Truffe-Ricotta, Courgette-Menthe.', 45.00, 'cocktail', 'premium', '/images/buffet_hero.jpg', 'italienne', 'végétarien', 'gluten,lactose');

  -- ==========================================
  -- PIÈCES COCKTAILS - DELUXE
  -- ==========================================
  INSERT INTO products (name, description, price, category, subcategory, image, cuisine, dietary, allergies) VALUES 
  ('Écrin Deluxe', 'Blinis au Caviar Baeri, carpaccio de Saint-Jacques à la truffe, homard en gelée d''agrumes.', 95.00, 'cocktail', 'deluxe', '/images/cocktail_hero.jpg', 'française', 'poisson', 'crustacés,lactose,gluten'),
  ('Le Caviar & Vodka', '30g de Caviar Osciètre, blinis tièdes, crème d''Isigny, shot de Vodka Beluga (10cl).', 120.00, 'cocktail', 'deluxe', '/images/hero.jpg', 'française,russe', 'poisson', 'lactose,gluten'),
  ('Folie Truffée', 'Tout à la truffe noire: 12 pièces incluant brouillade, croque-monsieur truffé.', 85.00, 'cocktail', 'deluxe', '/images/main_hero.jpg', 'française', 'végétarien,carnivore', 'lactose,gluten'),
  ('Homard Excellence', 'Déclinaison autour du homard bleu: 8 pièces (Raviole, Mini-sandwich, Bisque crèmeuse).', 88.00, 'cocktail', 'deluxe', '/images/buffet_hero.jpg', 'française', 'poisson', 'crustacés,lactose,gluten'),
  ('Orfèvrerie Sucrée', '12 bijoux sucrés: Dôme or-chocolat, religieuse à la rose.', 75.00, 'cocktail', 'deluxe', '/images/dessert_hero.jpg', 'française', 'végétarien', 'lactose,gluten');
`);

console.log('Database mass population complete.');
