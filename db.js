// Simple SQLite database setup for tasks
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Database file under /database/tasks.db
const dbPath = path.join(__dirname, "..", "..", "database", "tasks.db");
const db = new sqlite3.Database(dbPath);

// Initialize schema if not exists
const init = () => {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        duration INTEGER NOT NULL,
        start TEXT NOT NULL
      );`
    );
  });
};

init();

module.exports = db;
