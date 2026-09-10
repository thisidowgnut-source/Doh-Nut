// Simple direct SQLite test
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/custom.db');

db.serialize(() => {
  db.all("SELECT COUNT(*) as count FROM Donut", [], (err, rows) => {
    if (err) {
      throw err;
    }
    console.log("Donut count:", rows[0].count);
    
    db.all("SELECT name, price FROM Donut ORDER BY price DESC LIMIT 3", [], (err, rows) => {
      if (err) {
        throw err;
      }
      console.log("Top 3 most expensive donuts:");
      rows.forEach(row => {
        console.log(`- ${row.name}: $${row.price}`);
      });
      db.close();
    });
  });
});
