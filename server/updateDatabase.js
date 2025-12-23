import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // XAMPP default
    multipleStatements: true
};

async function updateDatabase() {
    let connection;
    try {
        console.log('🔌 Connecting to MySQL server...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected.');

        const sqlPath = path.join(__dirname, '../enhanced_schema.sql');
        console.log(`📖 Reading SQL file from: ${sqlPath}`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Executing SQL commands to update database...');
        await connection.query(sql);

        console.log('✨ Success! Database "afta_delivery" updated with enhanced schema.');

    } catch (error) {
        console.error('❌ Database Update Failed:');
        console.error(error);
    } finally {
        if (connection) await connection.end();
    }
}

updateDatabase();
