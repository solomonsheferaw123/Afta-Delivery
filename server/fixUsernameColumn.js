import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // XAMPP default
    database: 'afta_delivery'
};

async function fixDatabaseColumns() {
    let connection;
    try {
        console.log('🔌 Connecting to MySQL server...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to afta_delivery database.');

        // Check if username column exists
        const [usernameColumns] = await connection.query(
            "SHOW COLUMNS FROM users LIKE 'username'"
        );

        if (usernameColumns.length === 0) {
            console.log('❌ Username column not found. Adding it now...');

            // First, add username column without UNIQUE constraint
            await connection.query(
                `ALTER TABLE users 
                ADD COLUMN username VARCHAR(50) AFTER id`
            );

            console.log('✅ Username column added.');

            // Update existing users to have unique usernames
            const [users] = await connection.query('SELECT id, phone_number FROM users');
            for (const user of users) {
                const username = `user_${user.phone_number}`;
                await connection.query(
                    'UPDATE users SET username = ? WHERE id = ?',
                    [username, user.id]
                );
            }

            console.log('✅ Existing users updated with usernames.');

            // Now add UNIQUE constraint
            await connection.query(
                `ALTER TABLE users 
                MODIFY COLUMN username VARCHAR(50) NOT NULL UNIQUE`
            );

            console.log('✅ UNIQUE constraint added to username column.');
        } else {
            console.log('✅ Username column already exists.');

            // Check if there are any NULL or empty usernames
            const [nullUsers] = await connection.query(
                'SELECT id, phone_number FROM users WHERE username IS NULL OR username = ""'
            );

            if (nullUsers.length > 0) {
                console.log(`📝 Found ${nullUsers.length} users without usernames. Fixing...`);

                for (const user of nullUsers) {
                    const username = `user_${user.phone_number}`;
                    await connection.query(
                        'UPDATE users SET username = ? WHERE id = ?',
                        [username, user.id]
                    );
                }

                console.log('✅ All users now have usernames.');
            }
        }

        // Check if email column exists
        const [emailColumns] = await connection.query(
            "SHOW COLUMNS FROM users LIKE 'email'"
        );

        if (emailColumns.length === 0) {
            console.log('❌ Email column not found. Adding it now...');

            await connection.query(
                `ALTER TABLE users 
                ADD COLUMN email VARCHAR(255) UNIQUE AFTER username`
            );

            console.log('✅ Email column added.');
        } else {
            console.log('✅ Email column already exists.');
        }

        console.log('🎉 Database fix completed successfully!');
        console.log('👉 You can now test signup again.');

    } catch (error) {
        console.error('❌ Database Fix Failed:');
        if (error.code === 'ECONNREFUSED') {
            console.error('   Could not connect to MySQL. Is XAMPP running?');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('   Database "afta_delivery" not found. Run setupDatabase.js first.');
        } else if (error.code === 'ER_DUP_ENTRY') {
            console.error('   Duplicate entry found. Please check your database manually.');
        } else {
            console.error(error);
        }
    } finally {
        if (connection) await connection.end();
    }
}

fixDatabaseColumns();

