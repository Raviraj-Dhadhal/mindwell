const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

// ── Register ───────────────────────────────────────────────────
router.post('/register', (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if user exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existing) {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }

    // Create user
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)'
    ).run(username, email, hash, username);

    // Create progress record
    db.prepare('INSERT INTO user_progress (user_id) VALUES (?)').run(result.lastInsertRowid);

    // Log activity
    db.prepare('INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)').run(
      result.lastInsertRowid, 'register', 'New user registered'
    );

    // Generate token
    const token = jwt.sign(
      { id: result.lastInsertRowid, username, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: result.lastInsertRowid, username, email, role: 'user', display_name: username, avatar_url: '/assets/default-avatar.svg' }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── Login ──────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(email, email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Log activity
    db.prepare('INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)').run(
      user.id, 'login', 'User logged in'
    );

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        theme_pref: user.theme_pref
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
