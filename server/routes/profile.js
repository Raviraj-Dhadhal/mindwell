const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// ── Get Profile ────────────────────────────────────────────────
router.get('/', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(
      'SELECT id, username, email, role, display_name, bio, avatar_url, theme_pref, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Get mood stats
    const moodStats = db.prepare(
      'SELECT COUNT(*) as total_entries, AVG(mood_score) as avg_mood FROM mood_entries WHERE user_id = ?'
    ).get(req.user.id);

    // Get progress
    const progress = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(req.user.id);

    res.json({ user, moodStats, progress });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Update Profile ─────────────────────────────────────────────
router.put('/', authenticateToken, (req, res) => {
  try {
    const { display_name, bio, theme_pref } = req.body;

    db.prepare(
      'UPDATE users SET display_name = COALESCE(?, display_name), bio = COALESCE(?, bio), theme_pref = COALESCE(?, theme_pref) WHERE id = ?'
    ).run(display_name, bio, theme_pref, req.user.id);

    // Log activity
    db.prepare('INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)').run(
      req.user.id, 'profile_update', 'Profile updated'
    );

    const user = db.prepare(
      'SELECT id, username, email, role, display_name, bio, avatar_url, theme_pref FROM users WHERE id = ?'
    ).get(req.user.id);

    res.json({ message: 'Profile updated!', user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Get User History ───────────────────────────────────────────
router.get('/history', authenticateToken, (req, res) => {
  try {
    const id = req.user.id;
    
    const moodEntries = db.prepare(
      'SELECT "mood" as type, id, mood_score, emoji, note, created_at FROM mood_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
    ).all(id);

    const stressPoints = db.prepare(
      'SELECT "stress" as type, id, category, intensity, description, created_at FROM stress_points WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
    ).all(id);

    const history = [...moodEntries, ...stressPoints]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 20);

    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Get Support Notes ──────────────────────────────────────────
router.get('/support-notes', authenticateToken, (req, res) => {
  try {
    const id = req.user.id;
    // Get latest unread note
    const note = db.prepare(
      'SELECT * FROM support_notes WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC LIMIT 1'
    ).get(id);

    if (note) {
      db.prepare('UPDATE support_notes SET is_read = 1 WHERE id = ?').run(note.id);
    }

    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
