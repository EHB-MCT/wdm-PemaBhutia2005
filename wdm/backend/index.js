const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// In-memory storage for clothing items
let clothingItems = [];

// GET all clothing items
app.get("/api/clothing-items", (req, res) => {
  res.json(clothingItems);
});

// POST a new clothing item with image
app.post("/api/clothing-items", upload.single('image'), (req, res) => {
  try {
    const { brand, price, season, size } = req.body;
    
    const newItem = {
      id: Date.now(),
      brand: brand || '',
      price: price || '',
      season: season || '',
      size: size || '',
      imagePath: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date().toISOString()
    };
    
    clothingItems.push(newItem);
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save clothing item' });
  }
});

app.listen(5000, "0.0.0.0", () => {
	console.log("running on port 5000");
});
