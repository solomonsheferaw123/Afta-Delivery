import db from './db.js';
import bcrypt from 'bcrypt';

async function createAdmin() {
    try {
        const username = 'admin';
        const password = 'admin123';
        const fullName = 'System Administrator';
        const phone = '0900000000';
        const userType = 'admin';

        console.log('⏳ Hashing password...');
        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Check if admin exists
        console.log('🔍 Checking for existing admin...');
        const [existing] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (existing.length > 0) {
            console.log('⚡ Admin user already exists. Updating password and privileges...');
            await db.query('UPDATE users SET password_hash = ?, user_type = ?, is_activated = 1 WHERE username = ?', [passwordHash, userType, username]);
        } else {
            console.log('✨ Creating new admin user...');
            await db.query(
                'INSERT INTO users (username, full_name, phone_number, password_hash, wallet_balance, user_type, is_activated) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [username, fullName, phone, passwordHash, 999999, userType, 1]
            );
        }

        console.log('\n=======================================');
        console.log('✅ ADMIN ACCOUNT READY');
        console.log('=======================================');
        console.log(`👤 Username: ${username}`);
        console.log(`🔑 Password: ${password}`);
        console.log('=======================================\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating admin:', err);
        process.exit(1);
    }
}

createAdmin();
