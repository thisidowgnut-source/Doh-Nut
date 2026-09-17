// Simple direct SQLite smoke test for the local development database.
import sqlite3Package from "sqlite3";

const sqlite3 = sqlite3Package.verbose();
const db = new sqlite3.Database("./db/custom.db");

db.serialize(() => {
  db.all("SELECT COUNT(*) as count FROM Donut", [], (countError, countRows) => {
    if (countError) {
      db.close();
      throw countError;
    }

    console.log("Donut count:", countRows[0].count);

    db.all(
      "SELECT name, price FROM Donut ORDER BY price DESC LIMIT 3",
      [],
      (topDonutsError, topDonutsRows) => {
        if (topDonutsError) {
          db.close();
          throw topDonutsError;
        }

        console.log("Top 3 most expensive donuts:");
        topDonutsRows.forEach((row) => {
          console.log(`- ${row.name}: RM ${row.price}`);
        });
        db.close();
      },
    );
  });
});
