const express = require("express");
const cors = require("cors");
const path = require("path");

// Initialize database
require('./config/database');

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const clothingItemsRoutes = require('./routes/clothing-items');

app.use('/api/auth', authRoutes);
app.use('/api/clothing-items', clothingItemsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server running on port ${PORT}`);
});
