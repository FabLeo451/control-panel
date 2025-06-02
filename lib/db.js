const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.NEXT_PUBLIC_DB_HOST,
    port: process.env.NEXT_PUBLIC_DB_PORT,
    user: process.env.NEXT_PUBLIC_DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

module.exports = pool;

