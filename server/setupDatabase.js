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

async function setupDatabase() {
    let connection;
    try {
        console.log('🔌 Connecting to MySQL server...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected.');

        const sqlPath = path.join(__dirname, '../database.sql');
        console.log(`📖 Reading SQL file from: ${sqlPath}`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Executing SQL commands to create database and tables...');
        await connection.query(sql);

        console.log('✨ Success! Database "afta_delivery" created and seeded.');
        console.log('👉 You can now restart the app with "npm run dev".');

    } catch (error) {
        console.error('❌ Database Setup Failed:');
        if (error.code === 'ECONNREFUSED') {
            console.error('   Could not connect to MySQL. Is XAMPP running?');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('   Access denied. Do you have a password set for "root"?');
        } else {
            console.error(error);
        }
    } finally {
        if (connection) await connection.end();
    }
}

setupDatabase();
