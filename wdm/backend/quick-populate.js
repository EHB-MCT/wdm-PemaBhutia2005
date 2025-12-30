const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Test users with their clothing items and EXIF data
const sampleData = [
  {
    name: 'Alice Johnson',
    email: 'alice@test.com',
    password: 'password123',
    is_admin: 0,
    brand: 'Nike',
    price: '89.99',
    season: 'Spring',
    size: 'M',
    category: 'tops',
    exifData: {
      gps_lat: 40.7128,
      gps_lon: -74.0060,
      gps_alt: 10.5,
      datetime_original: '2024-03-15T14:30:00.000Z',
      camera_make: 'Apple',
      camera_model: 'iPhone 14 Pro',
      software: 'iOS 17.2'
    }
  },
  {
    name: 'Alice Johnson',
    email: 'alice@test.com',
    password: 'password123',
    is_admin: 0,
    brand: 'Levi\'s',
    price: '79.50',
    season: 'Fall',
    size: 'L',
    category: 'bottoms',
    exifData: {
      gps_lat: 34.0522,
      gps_lon: -118.2437,
      gps_alt: 123.2,
      datetime_original: '2024-02-20T10:15:00.000Z',
      camera_make: 'Apple',
      camera_model: 'iPhone 13',
      software: 'iOS 16.5'
    }
  },
  {
    name: 'Bob Smith',
    email: 'bob@test.com',
    password: 'password123',
    is_admin: 0,
    brand: 'Adidas',
    price: '120.00',
    season: 'Winter',
    size: '10',
    category: 'shoes',
    exifData: {
      gps_lat: 51.5074,
      gps_lon: -0.1278,
      gps_alt: 35.7,
      datetime_original: '2024-01-10T16:45:00.000Z',
      camera_make: 'Samsung',
      camera_model: 'Galaxy S23',
      software: 'Android 14'
    }
  }
];

async function quickPopulate() {
  console.log('Quick populating database...');
  
  const dbPath = path.join(__dirname, 'database.sqlite');
  const db = new sqlite3.Database(dbPath);

  for (const data of sampleData) {
    // Check if user exists first
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [data.email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    let userId;
    if (existingUser) {
      userId = existingUser.id;
      console.log(`Using existing user: ${data.name}`);
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(data.password, 10);
      userId = uuidv4();
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (id, name, email, password, is_admin) VALUES (?, ?, ?, ?, ?)',
          [userId, data.name, data.email, hashedPassword, data.is_admin],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      console.log(`Created user: ${data.name}`);
    }
    
    // Insert clothing item
    const itemId = uuidv4();
    const imagePath = `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
    
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO clothing_items (
          id, user_id, brand, price, season, size, category, image_path,
          gps_lat, gps_lon, gps_alt, datetime_original, camera_make, camera_model, software
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        itemId, userId, data.brand, data.price, data.season, data.size, data.category, imagePath,
        data.exifData.gps_lat, data.exifData.gps_lon, data.exifData.gps_alt,
        data.exifData.datetime_original, data.exifData.camera_make, 
        data.exifData.camera_model, data.exifData.software
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    console.log(`  - Added item: ${data.brand} ${data.category}`);
  }
  
  console.log('Population complete!');
  db.close();
}

quickPopulate().catch(console.error);