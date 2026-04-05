const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '0000',
  database: 'smart_board',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = db.promise();