import db from './server/db.js';

async function migrate() {
    try {
        console.log('Starting migration...');

        // Check if column exists
        const [columns] = await db.query('SHOW COLUMNS FROM users LIKE "is_activated"');

        if (columns.length === 0) {
            console.log('Adding "is_activated" column to users table...');
            await db.query('ALTER TABLE users ADD COLUMN is_activated TINYINT(1) DEFAULT 0');
            console.log('Column added successfully!');
        } else {
            console.log('Column "is_activated" already exists.');
        }

        // Also update existing users to avoid confusion if needed
        // await db.query('UPDATE users SET is_activated = 1');
        // console.log('Existing users activated.');

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
