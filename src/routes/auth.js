// Import Express and JWT library
const express = require('express');
const jwt = require('jsonwebtoken');
// Import User model and response helpers
const User = require('../models/User');
const { ok, created, bad, serverError } = require('../utils/response');

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    // Validate input presence
    if (!email || !password) return bad(res, 'email and password are required');

    // Check if email is already in use
    const exists = await User.findOne({ email });
    if (exists) return bad(res, 'Email already registered');

    // Create new user (password hashing is handled by User model pre-save hook)
    const user = await User.create({ email, password });
    
    // Return success response (excluding password)
    return created(res, { id: user._id, email: user.email });
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/auth/login - Authenticate user and return JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    // Validate input presence
    if (!email || !password) return bad(res, 'email and password are required');

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return bad(res, 'Invalid email or password');

    // Verify password using the model method
    const okPass = await user.comparePassword(password);
    if (!okPass) return bad(res, 'Invalid email or password');

    // Generate JWT token with user ID payload
    // Token expires in 1 hour
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Return token to client
    return ok(res, { token });
  } catch (err) {
    return serverError(res, err);
  }
});

module.exports = router;
