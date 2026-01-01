const express = require('express');
const Outfit = require('../models/Outfit');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all outfits for authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const outfits = await Outfit.findByUserId(req.user.id);
    res.json(outfits);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching outfits.' });
  }
});

// Create a new outfit
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, topId, bottomId, shoesId } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Outfit name is required.' });
    }

    const newOutfit = await Outfit.create(
      req.user.id,
      name,
      topId || null,
      bottomId || null,
      shoesId || null
    );

    res.status(201).json(newOutfit);
  } catch (error) {
    res.status(500).json({ error: 'Server error while creating outfit.' });
  }
});

// Delete an outfit
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await Outfit.delete(req.params.id, req.user.id);
    
    if (!result.deleted) {
      return res.status(404).json({ error: 'Outfit not found or you do not have permission to delete it.' });
    }

    res.json({ message: 'Outfit deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error while deleting outfit.' });
  }
});

module.exports = router;