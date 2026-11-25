const mysql = require('mysql2/promise');

// A pool reconnects automatically if MySQL drops an idle connection.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'recipe_explorer',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
