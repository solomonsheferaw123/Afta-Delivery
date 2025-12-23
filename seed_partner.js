import db from './server/db.js';
import bcrypt from 'bcrypt';

async function seedPartner() {
    const passwordHash = await bcrypt.hash('partner123', 10);
    try {
        await db.query(`
            INSERT INTO users (username, email, full_name, phone_number, password_hash, user_type, wallet_balance, is_activated)
            VALUES ('sishupartner', 'sishu@afta.et', 'Sishu Partner', '0911000000', ?, 'restaurant', 5000, 1)
            ON DUPLICATE KEY UPDATE user_type = 'restaurant'
        `, [passwordHash]);
        console.log('Partner user seeded: sishupartner / partner123');
    } catch (err) {
        console.error('Error seeding partner:', err);
    } finally {
        process.exit();
    }
}

seedPartner();
