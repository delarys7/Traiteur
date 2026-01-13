/* eslint-disable */
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'traiteur.db');
const db = new Database(dbPath);

console.log('Adding boutique products to database at:', dbPath);

// Ajouter un champ meat_type si nécessaire (pour les produits boutique)
// On va utiliser le champ dietary pour stocker "viande rouge" ou "viande blanche"
// et cuisine pour stocker "boutique" ou NULL

db.exec(`
  -- ==========================================
  -- BOUTIQUE PROFESSIONNELLE - VIANDES PREMIUM
  -- ==========================================
  INSERT INTO products (name, description, price, category, subcategory, image, cuisine, dietary, allergies) VALUES 
  ('Gigot d''Agneau Label Rouge', 'Gigot d''agneau français Label Rouge, 2,5 kg, prêt à rôtir. Viande tendre et savoureuse, idéale pour les grandes occasions.', 85.00, 'boutique', NULL, '/images/buffet_hero.jpg', NULL, 'viande rouge', 'aucune'),
  ('Carré d''Agneau Entier', 'Carré d''agneau premium, 8 côtelettes, 1,8 kg. Viande d''exception, parfaite pour les réceptions haut de gamme.', 95.00, 'boutique', NULL, '/images/hero.jpg', NULL, 'viande rouge', 'aucune'),
  ('Filet de Bœuf Charolais', 'Filet de bœuf Charolais AOC, 1,5 kg. Viande d''exception, tendre et persillée, sélection premium pour distributeurs de luxe.', 120.00, 'boutique', NULL, '/images/main_hero.jpg', NULL, 'viande rouge', 'aucune'),
  ('Côte de Bœuf Maturée', 'Côte de bœuf maturée 30 jours, 1,2 kg. Affinage optimal pour une saveur incomparable, pièce maîtresse des tables d''exception.', 110.00, 'boutique', NULL, '/images/chef_hero.jpg', NULL, 'viande rouge', 'aucune'),
  ('Entrecôte Wagyu', 'Entrecôte Wagyu A5, 800g. Marbrure exceptionnelle, saveur intense et fondante. Le summum de l''excellence carnée.', 180.00, 'boutique', NULL, '/images/buffet_hero.jpg', NULL, 'viande rouge', 'aucune'),
  ('Rôti de Porc Fermier', 'Rôti de porc fermier Label Rouge, 2 kg. Viande savoureuse et juteuse, élevage respectueux, qualité premium.', 65.00, 'boutique', NULL, '/images/dessert_hero.jpg', NULL, 'viande blanche', 'aucune'),
  ('Carré de Porc Entier', 'Carré de porc fermier, 6 côtelettes, 1,5 kg. Viande tendre et parfumée, sélection premium pour professionnels.', 70.00, 'boutique', NULL, '/images/cocktail_hero.jpg', NULL, 'viande blanche', 'aucune'),
  ('Poulet Fermier Label Rouge', 'Poulet fermier Label Rouge entier, 1,8 kg. Élevé en plein air, chair ferme et savoureuse, qualité d''exception.', 45.00, 'boutique', NULL, '/images/hero.jpg', NULL, 'viande blanche', 'aucune'),
  ('Suprêmes de Volaille', 'Suprêmes de volaille fermière, 1 kg (4 pièces). Viande blanche tendre et juteuse, parfaite pour les préparations raffinées.', 38.00, 'boutique', NULL, '/images/main_hero.jpg', NULL, 'viande blanche', 'aucune'),
  ('Canard de Challans', 'Canard de Challans entier, 2,2 kg. Volaille d''exception, chair fine et savoureuse, référence gastronomique française.', 55.00, 'boutique', NULL, '/images/buffet_hero.jpg', NULL, 'viande blanche', 'aucune'),
  ('Magret de Canard', 'Magret de canard fermier, 2 pièces, 600g. Viande persillée et savoureuse, sélection premium pour professionnels.', 48.00, 'boutique', NULL, '/images/chef_hero.jpg', NULL, 'viande blanche', 'aucune'),
  ('Caille Fermière', 'Caille fermière entière, 4 pièces, 600g. Volaille fine et délicate, idéale pour les préparations gastronomiques.', 42.00, 'boutique', NULL, '/images/dessert_hero.jpg', NULL, 'viande blanche', 'aucune');
`);

console.log('Boutique products added successfully.');
db.close();
