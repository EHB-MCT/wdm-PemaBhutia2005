const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Create new user
    const newUser = await User.create(name, email, password);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Validate password
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    res.json({ user });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    res.status(500).json({ error: 'Server error.' });
  }
});

// Admin register endpoint
router.post('/admin/register', async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Simple admin key validation (in production, use a more secure method)
    const ADMIN_REGISTRATION_KEY = process.env.ADMIN_REGISTRATION_KEY || 'admin-secret-key-2024';
    if (adminKey !== ADMIN_REGISTRATION_KEY) {
      return res.status(403).json({ error: 'Invalid admin registration key.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Admin password must be at least 8 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Create new admin user
    const newAdmin = await User.createAdmin(name, email, password);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newAdmin.id, email: newAdmin.email, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Admin registered successfully',
      user: { id: newAdmin.id, name: newAdmin.name, email: newAdmin.email, is_admin: true },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during admin registration.' });
  }
});

// Admin login endpoint
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if user is admin
    if (!user.is_admin) {
      return res.status(403).json({ error: 'Access denied. User is not an administrator.' });
    }

    // Validate password
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Admin login successful',
      user: { id: user.id, name: user.name, email: user.email, is_admin: true },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during admin login.' });
  }
});

module.exports = router;