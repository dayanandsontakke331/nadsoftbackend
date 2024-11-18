const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'memberstudent',
    password: '1234',
    port: 5432
});

pool.connect((err) => {
    if (err) {
        console.error('PostgreSQL connect Error:', err);
    } else {
        console.log('Connected to PostgreSQL');
    }
});

module.exports = pool;
