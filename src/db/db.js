const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: String(process.env.PGPASSWORD),
  port: Number(process.env.PGPORT),
  options: '-c search_path=public',
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

module.exports = pool;


