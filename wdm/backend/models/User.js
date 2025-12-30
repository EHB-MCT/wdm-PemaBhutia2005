const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create(name, email, password, isAdmin = false) {
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (id, name, email, password, is_admin)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.run(query, [userId, name, email, hashedPassword, isAdmin], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: userId, name, email, is_admin: isAdmin });
        }
      });
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      
      db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async createAdmin(name, email, password) {
    return await this.create(name, email, password, true);
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, name, email, created_at FROM users WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;