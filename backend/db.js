// backend/db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',       // Change if your MySQL username is different
  password: 'Nisha@17',       // Set this if your MySQL has a password
  database: 'library_db'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection error:', err.message);
    throw err;
  }
  console.log('✅ MySQL Connected');
});

module.exports = connection;
