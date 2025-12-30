const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ClothingItem = require("../models/ClothingItem");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const exifr = require("exifr");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
	},
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
	fileFilter: (req, file, cb) => {
		const allowedTypes = /jpeg|jpg|png|gif/;
		const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
		const mimetype = allowedTypes.test(file.mimetype);

		if (mimetype && extname) {
			return cb(null, true);
		} else {
			cb(new Error("Only image files are allowed (JPEG, JPG, PNG, GIF)"));
		}
	},
});

// Get all clothing items for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
	try {
		const items = await ClothingItem.findByUserId(req.user.id);
		res.json(items);
	} catch (error) {
		console.error("Error fetching clothing items:", error);
		res.status(500).json({ error: "Server error while fetching clothing items." });
	}
});

// Extract EXIF data from image
async function extractExifData(filePath) {
	try {
		const exifData = await exifr.parse(filePath);
		
		return {
			gps_lat: exifData?.latitude || null,
			gps_lon: exifData?.longitude || null,
			gps_alt: exifData?.altitude || null,
			datetime_original: exifData?.DateTimeOriginal ? exifData.DateTimeOriginal.toISOString() : null,
			camera_make: exifData?.Make || null,
			camera_model: exifData?.Model || null,
			software: exifData?.Software || null,
		};
	} catch (error) {
		console.error("Error extracting EXIF data:", error);
		return {};
	}
}

// Add a new clothing item (authenticated users only)
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No image file provided." });
		}

		const { brand, price, season, size, category } = req.body;

		console.log("Creating item:", { brand, price, season, size, category, user: req.user.id, file: req.file?.filename });

		// Extract EXIF data from the uploaded image
		const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
		const exifData = await extractExifData(filePath);

		console.log("Extracted EXIF data:", exifData);

		const newItem = await ClothingItem.create(
			req.user.id, 
			brand || "", 
			price || "", 
			season || "", 
			size || "", 
			category || "", 
			req.file.filename,
			exifData
		);

		console.log("Item created:", newItem);
		res.status(201).json(newItem);
	} catch (error) {
		console.error("Error adding clothing item:", error);
		console.error("Error details:", error.message);
		console.error("Error stack:", error.stack);
		res.status(500).json({ error: "Server error while adding clothing item." });
	}
});

// Delete a clothing item (authenticated users only, can only delete their own items)
router.delete("/:id", authMiddleware, async (req, res) => {
	try {
		const result = await ClothingItem.delete(req.params.id, req.user.id);

		if (!result.deleted) {
			return res.status(404).json({ error: "Clothing item not found or you do not have permission to delete it." });
		}

		res.json({ message: "Clothing item deleted successfully." });
	} catch (error) {
		console.error("Error deleting clothing item:", error);
		res.status(500).json({ error: "Server error while deleting clothing item." });
	}
});

// Admin routes

// Debug endpoint to check current user's admin status
router.get("/admin/check-status", authMiddleware, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		res.json({
			user: user,
			is_admin: user.is_admin,
			is_admin_type: typeof user.is_admin,
			is_admin_boolean: Boolean(user.is_admin)
		});
	} catch (error) {
		console.error("Error checking admin status:", error);
		res.status(500).json({ error: "Server error while checking admin status." });
	}
});

// Get all users with their clothing items and EXIF data (admin only)
router.get("/admin/users-with-items", authMiddleware, async (req, res) => {
	try {
		// Check if user is admin
		const user = await User.findById(req.user.id);
		console.log("Admin check - User:", user); // Debug log
		console.log("Admin check - is_admin:", user.is_admin, "Type:", typeof user.is_admin); // Debug log
		
		if (!user || (user.is_admin !== 1 && user.is_admin !== true)) {
			console.log("Access denied - user is not admin"); // Debug log
			return res.status(403).json({ error: "Access denied. Admin privileges required." });
		}

		console.log("Access granted - user is admin"); // Debug log

		// Get all users
		const db = require("../config/database");
		const users = await new Promise((resolve, reject) => {
			db.all('SELECT id, name, email, created_at FROM users', (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});

		// Get clothing items for each user
		const usersWithItems = await Promise.all(
			users.map(async (user) => {
				const items = await ClothingItem.findByUserId(user.id);
				return {
					...user,
					items: items
				};
			})
		);

		res.json(usersWithItems);
	} catch (error) {
		console.error("Error fetching admin data:", error);
		res.status(500).json({ error: "Server error while fetching admin data." });
	}
});

// Emergency endpoint to make a user admin (for development only)
router.post("/admin/make-admin", authMiddleware, async (req, res) => {
	try {
		const { userId } = req.body;
		const db = require("../config/database");
		
		db.run('UPDATE users SET is_admin = 1 WHERE id = ?', [userId], function(err) {
			if (err) {
				console.error("Error making user admin:", err);
				return res.status(500).json({ error: "Failed to make user admin." });
			}
			res.json({ message: "User promoted to admin successfully." });
		});
	} catch (error) {
		console.error("Error making user admin:", error);
		res.status(500).json({ error: "Server error while making user admin." });
	}
});

module.exports = router;
