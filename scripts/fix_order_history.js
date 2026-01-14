const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traiteur.db');
const db = new Database(dbPath);

console.log('Fixing order history in:', dbPath);

try {
    const orders = db.prepare('SELECT * FROM orders').all();
    const updateStmt = db.prepare('UPDATE orders SET history = ? WHERE id = ?');

    let updatedCount = 0;

    db.transaction(() => {
        for (const order of orders) {
            const history = [];
            const createdDate = new Date(order.createdAt);
            
            // 1. Created (Always present)
            history.push({
                status: 'pending_confirmation',
                date: createdDate.toISOString(),
                label: 'En attente'
            });

            // If status is NOT pending, assume it was approved
            if (['validated', 'paid', 'received'].includes(order.status)) {
                const validatedDate = new Date(createdDate);
                validatedDate.setHours(validatedDate.getHours() + 2); // Approved 2 hours later
                history.push({
                    status: 'validated',
                    date: validatedDate.toISOString(),
                    label: 'Approuvée'
                });
            }

            // If status is paid or received
            if (['paid', 'received'].includes(order.status)) {
                const paidDate = new Date(createdDate);
                paidDate.setHours(paidDate.getHours() + 26); // Paid next day
                history.push({
                    status: 'paid',
                    date: paidDate.toISOString(),
                    label: 'Payée'
                });
            }

            // If status is received
            if (order.status === 'received') {
                const receivedDate = new Date(createdDate);
                receivedDate.setHours(receivedDate.getHours() + 50); // Received 2 days later
                history.push({
                    status: 'received',
                    date: receivedDate.toISOString(),
                    label: 'Réceptionnée'
                });
            }

             // If status is refused (edge case)
             if (order.status === 'refused') {
                const refusedDate = new Date(createdDate);
                refusedDate.setHours(refusedDate.getHours() + 1);
                history.push({
                    status: 'refused',
                    date: refusedDate.toISOString(),
                    label: 'Refusée'
                });
            }


            updateStmt.run(JSON.stringify(history), order.id);
            updatedCount++;
        }
    })();

    console.log(`Updated history for ${updatedCount} orders.`);

} catch (error) {
    console.error('Error fixing history:', error);
} finally {
    db.close();
}
