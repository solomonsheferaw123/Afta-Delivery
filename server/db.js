import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // XAMPP default
    database: 'afta_delivery',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused. Make sure XAMPP MySQL is running.');
        }
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('Database "afta_delivery" not found. Please import database.sql into XAMPP.');
        }
    }
    if (connection) connection.release();
});

export default db.promise();
