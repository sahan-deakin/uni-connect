const express  = require('express');
const jwt      = require('jsonwebtoken');
const User     = require('../models/userModel');
const Student  = require('../models/studentModel');

const router     = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'uniconnect-dev-secret';
const JWT_EXPIRY = '7d';

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user account
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if blocked
    if (user.isCurrentlyBlocked) {
      return res.status(403).json({ error: 'Your account has been suspended' });
    }

    // Verify password
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Find linked student profile (optional — dashboard uses studentId from token)
    const student = await Student.findOne({ email: user.email });

    // Sign JWT
    const payload = {
      userId:    user._id,
      studentId: student ? student._id : null,
      email:     user.email,
      role:      user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.json({
      token,
      user: {
        id:       user._id,
        username: user.username,
        email:    user.email,
        role:     user.role,
        name:     student ? student.name : user.username
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const user = await User.create({
      username: username.trim(),
      email:    email.toLowerCase().trim(),
      password                        // hashed by pre-save hook in userModel
    });

    const student = await Student.findOne({ email: user.email });

    const payload = {
      userId:    user._id,
      studentId: student ? student._id : null,
      email:     user.email,
      role:      user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.status(201).json({
      token,
      user: {
        id:       user._id,
        username: user.username,
        email:    user.email,
        role:     user.role,
        name:     student ? student.name : user.username
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user    = await User.findById(req.user.userId).select('-password');
    const student = await Student.findOne({ email: user.email });
    res.json({ user, student });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
