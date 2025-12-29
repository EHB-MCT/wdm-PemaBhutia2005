const express = require('express');
const multer = require('multer');
const path = require('path');
const ClothingItem = require('../models/ClothingItem');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF)'));
    }
  }
});

// Get all clothing items for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await ClothingItem.findByUserId(req.user.id);
    res.json(items);
  } catch (error) {
    console.error('Error fetching clothing items:', error);
    res.status(500).json({ error: 'Server error while fetching clothing items.' });
  }
});

// Add a new clothing item (authenticated users only)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const { brand, price, season, size, category } = req.body;
    
    const newItem = await ClothingItem.create(
      req.user.id,
      brand || '',
      price || '',
      season || '',
      size || '',
      category || '',
      req.file.filename
    );

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error adding clothing item:', error);
    res.status(500).json({ error: 'Server error while adding clothing item.' });
  }
});

// Delete a clothing item (authenticated users only, can only delete their own items)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await ClothingItem.delete(req.params.id, req.user.id);
    
    if (!result.deleted) {
      return res.status(404).json({ error: 'Clothing item not found or you do not have permission to delete it.' });
    }

    res.json({ message: 'Clothing item deleted successfully.' });
  } catch (error) {
    console.error('Error deleting clothing item:', error);
    res.status(500).json({ error: 'Server error while deleting clothing item.' });
  }
});

module.exports = router;