const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Outfit {
  static async create(userId, name, topId, bottomId, shoesId) {
    const outfitId = uuidv4();
    
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO outfits (id, user_id, name, top_id, bottom_id, shoes_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [outfitId, userId, name, topId, bottomId, shoesId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ 
            id: outfitId, 
            user_id: userId, 
            name,
            top_id: topId, 
            bottom_id: bottomId, 
            shoes_id: shoesId
          });
        }
      });
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT o.*, 
               t.brand as top_brand, t.image_path as top_image, t.category as top_category,
               b.brand as bottom_brand, b.image_path as bottom_image, b.category as bottom_category,
               s.brand as shoes_brand, s.image_path as shoes_image, s.category as shoes_category
        FROM outfits o
        LEFT JOIN clothing_items t ON o.top_id = t.id
        LEFT JOIN clothing_items b ON o.bottom_id = b.id
        LEFT JOIN clothing_items s ON o.shoes_id = s.id
        WHERE o.user_id = ? 
        ORDER BY o.created_at DESC
      `;
      
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async delete(outfitId, userId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM outfits WHERE id = ? AND user_id = ?';
      
      db.run(query, [outfitId, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  }
}

module.exports = Outfit;