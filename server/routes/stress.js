const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// ── Share Stress Points ────────────────────────────────────────
router.post('/', authenticateToken, (req, res) => {
  try {
    const { category, intensity, description, is_anonymous } = req.body;

    if (!category || !intensity) {
      return res.status(400).json({ error: 'Category and intensity are required.' });
    }
    if (intensity < 1 || intensity > 10) {
      return res.status(400).json({ error: 'Intensity must be 1-10.' });
    }

    db.prepare(
      'INSERT INTO stress_points (user_id, category, intensity, description, is_anonymous) VALUES (?, ?, ?, ?, ?)'
    ).run(req.user.id, category, intensity, description || '', is_anonymous ? 1 : 0);

    // Gamification XP for sharing
    db.prepare('UPDATE user_progress SET xp = xp + 15 WHERE user_id = ?').run(req.user.id);

    // Log activity
    db.prepare('INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)').run(
      req.user.id, 'stress_share', `Category: ${category}, Intensity: ${intensity}/10`
    );

    // Get matched suggestions
    const suggestions = db.prepare(
      'SELECT suggestion_text, resource_url FROM suggestions WHERE category = ? AND min_intensity <= ? AND max_intensity >= ?'
    ).all(category, intensity, intensity);

    res.status(201).json({
      message: 'Stress point shared. Here are some suggestions for you:',
      suggestions
    });
  } catch (err) {
    console.error('Stress error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Get Stress History ─────────────────────────────────────────
router.get('/', authenticateToken, (req, res) => {
  try {
    const entries = db.prepare(
      'SELECT * FROM stress_points WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
    ).all(req.user.id);

    res.json({ entries });
  } catch (err) {
    console.error('Stress history error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Get Suggestions for a Category ─────────────────────────────
router.get('/suggestions', authenticateToken, (req, res) => {
  try {
    const { category, intensity } = req.query;
    const suggestions = db.prepare(
      'SELECT suggestion_text, resource_url FROM suggestions WHERE category = ? AND min_intensity <= ? AND max_intensity >= ?'
    ).all(category || 'other', parseInt(intensity) || 5, parseInt(intensity) || 5);

    res.json({ suggestions });
  } catch (err) {
    console.error('Suggestions error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
