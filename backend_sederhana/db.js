const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'toko',
  password: 'ansen123',
  port: 5432,
});

module.exports = pool;
