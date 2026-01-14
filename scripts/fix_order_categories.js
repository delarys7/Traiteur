const db = require('better-sqlite3')('traiteur.db');

console.log('🔧 Starting Order Categories Fix...');

// 1. Load all products to build a lookup map (ID -> Category)
const products = db.prepare('SELECT id, name, category FROM products').all();
const productCategoryMap = {};
products.forEach(p => {
    productCategoryMap[p.id] = p.category;
    // Also map by name as fallback if IDs don't match (though they should)
    productCategoryMap[p.name] = p.category;
});

console.log(`📚 Loaded ${products.length} products for lookup.`);
// console.log('Sample lookup:', products.slice(0, 3));

// 2. Fetch all orders
const orders = db.prepare('SELECT id, items FROM orders').all();
console.log(`📦 Found ${orders.length} orders to check.`);

let updatedCount = 0;

const updateStmt = db.prepare('UPDATE orders SET items = ? WHERE id = ?');

db.transaction(() => {
    for (const order of orders) {
        let items;
        try {
            items = JSON.parse(order.items);
        } catch (e) {
            console.error(`❌ Failed to parse items for order ${order.id}:`, e);
            continue;
        }

        let hasChanges = false;
        const updatedItems = items.map(item => {
            // If category is missing or invalid, try to find it
            if (!item.category || item.category === 'Autres' || item.category === 'autres') {
                const foundCategory = productCategoryMap[item.id] || productCategoryMap[item.name];
                
                if (foundCategory) {
                    // console.log(`   - Order ${order.id}: Fixed "${item.name}" -> ${foundCategory}`);
                    hasChanges = true;
                    return { ...item, category: foundCategory };
                } else {
                    console.warn(`   ⚠️ Order ${order.id}: Could not find category for "${item.name}" (ID: ${item.id})`);
                }
            }
            return item;
        });

        if (hasChanges) {
            updateStmt.run(JSON.stringify(updatedItems), order.id);
            updatedCount++;
            console.log(`✅ Updated Order ${order.id}`);
        }
    }
})();

console.log(`\n🎉 Done! Updated ${updatedCount} orders.`);
