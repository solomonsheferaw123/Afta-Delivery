import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // XAMPP default
    database: 'afta_delivery'
};

async function createOrderItemsTable() {
    let connection;
    try {
        console.log('🔌 Connecting to MySQL server...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected.');

        console.log('🚀 Creating order_items table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT DEFAULT 1,
                price_per_unit DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

        console.log('✨ Success! order_items table created.');

    } catch (error) {
        console.error('❌ Table creation failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

createOrderItemsTable();
