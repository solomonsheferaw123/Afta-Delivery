
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function createPartner() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'afta_delivery'
    });

    const username = 'partner1';
    const password = 'password123';
    const fullName = 'Sishu Burger Partner';
    const phone = '0912340000'; // Ends in 0000 as per demo logic
    const email = 'partner@sishu.com';

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    try {
        const [existing] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            console.log('Partner user already exists');
            await connection.end();
            return;
        }

        await connection.query(
            'INSERT INTO users (username, email, full_name, phone_number, password_hash, wallet_balance, user_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, email, fullName, phone, passwordHash, 5000, 'restaurant']
        );

        console.log('Partner user created successfully!');
        console.log('Username: partner1');
        console.log('Password: password123');
    } catch (err) {
        console.error('Error creating partner:', err);
    } finally {
        await connection.end();
    }
}

createPartner();
