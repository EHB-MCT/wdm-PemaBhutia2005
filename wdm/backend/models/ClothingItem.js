const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class ClothingItem {
  static async create(userId, brand, price, season, size, imagePath) {
    const itemId = uuidv4();
    
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO clothing_items (id, user_id, brand, price, season, size, image_path)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [itemId, userId, brand, price, season, size, imagePath], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ 
            id: itemId, 
            user_id: userId, 
            brand, 
            price, 
            season, 
            size, 
            image_path: imagePath 
          });
        }
      });
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM clothing_items WHERE user_id = ? ORDER BY created_at DESC';
      
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async findById(itemId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM clothing_items WHERE id = ?';
      
      db.get(query, [itemId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async delete(itemId, userId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM clothing_items WHERE id = ? AND user_id = ?';
      
      db.run(query, [itemId, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  }
}

module.exports = ClothingItem;