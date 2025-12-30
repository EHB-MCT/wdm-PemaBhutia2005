const db = require("../config/database");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

class ClothingItem {
	static async create(userId, brand, price, season, size, category, imagePath, exifData = {}) {
		const itemId = uuidv4();

		return new Promise((resolve, reject) => {
			const query = `
        INSERT INTO clothing_items (id, user_id, brand, price, season, size, category, image_path, gps_lat, gps_lon, gps_alt, datetime_original, camera_make, camera_model, software)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

			const params = [
				itemId, userId, brand, price, season, size, category, imagePath,
				exifData.gps_lat || null,
				exifData.gps_lon || null,
				exifData.gps_alt || null,
				exifData.datetime_original || null,
				exifData.camera_make || null,
				exifData.camera_model || null,
				exifData.software || null
			];

			db.run(query, params, function (err) {
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
						category,
						image_path: imagePath,
						gps_lat: exifData.gps_lat,
						gps_lon: exifData.gps_lon,
						gps_alt: exifData.gps_alt,
						datetime_original: exifData.datetime_original,
						camera_make: exifData.camera_make,
						camera_model: exifData.camera_model,
						software: exifData.software,
					});
				}
			});
		});
	}

	static async findByUserId(userId) {
		return new Promise((resolve, reject) => {
			const query = "SELECT * FROM clothing_items WHERE user_id = ? ORDER BY created_at DESC";

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
			const query = "SELECT * FROM clothing_items WHERE id = ?";

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
			const query = "DELETE FROM clothing_items WHERE id = ? AND user_id = ?";

			db.run(query, [itemId, userId], function (err) {
				if (err) {
					reject(err);
				} else {
					resolve({ deleted: this.changes > 0 });
				}
			});
		});
	}

	static async validatePassword(plainPassword, hashedPassword) {
		return await bcrypt.compare(plainPassword, hashedPassword);
	}
}

module.exports = ClothingItem;
