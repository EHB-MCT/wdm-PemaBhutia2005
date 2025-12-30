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

// Create tables if they don't exist
db.serialize(() => {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create clothing items table with all required columns including category and EXIF data
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
      gps_lat REAL,
      gps_lon REAL,
      gps_alt REAL,
      datetime_original TEXT,
      camera_make TEXT,
      camera_model TEXT,
      software TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);
  
  console.log('Database schema updated successfully');
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
      is_admin BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Clothing items table (updated to include user_id, category, and EXIF data)
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
      gps_lat REAL,
      gps_lon REAL,
      gps_alt REAL,
      datetime_original TEXT,
      camera_make TEXT,
      camera_model TEXT,
      software TEXT,
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

  // Add EXIF data columns if they don't exist (for existing databases)
  const exifColumns = [
    'gps_lat REAL',
    'gps_lon REAL', 
    'gps_alt REAL',
    'datetime_original TEXT',
    'camera_make TEXT',
    'camera_model TEXT',
    'software TEXT'
  ];

  exifColumns.forEach(column => {
    const [colName, colType] = column.split(' ');
    db.run(`
      ALTER TABLE clothing_items ADD COLUMN ${column}
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log(`${colName} column already exists or error adding it:`, err.message);
      }
    });
  });

  // Add is_admin column if it doesn't exist (for existing databases)
  db.run(`
    ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('is_admin column already exists or error adding it:', err.message);
    }
  });

  // Create outfits table
  db.run(`
    CREATE TABLE IF NOT EXISTS outfits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      top_id TEXT,
      bottom_id TEXT,
      shoes_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (top_id) REFERENCES clothing_items (id) ON DELETE SET NULL,
      FOREIGN KEY (bottom_id) REFERENCES clothing_items (id) ON DELETE SET NULL,
      FOREIGN KEY (shoes_id) REFERENCES clothing_items (id) ON DELETE SET NULL
    )
  `);
});

module.exports = db;