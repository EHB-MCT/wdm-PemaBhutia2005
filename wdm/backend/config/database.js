const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Clothing items table (updated to include user_id)
  db.run(`
    CREATE TABLE IF NOT EXISTS clothing_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      brand TEXT,
      price TEXT,
      season TEXT,
      size TEXT,
      category TEXT,
      image_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Add category column if it doesn't exist (for existing databases)
  db.run(`
    ALTER TABLE clothing_items ADD COLUMN category TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Category column already exists or error adding it:', err.message);
    }
  });
});

module.exports = db;