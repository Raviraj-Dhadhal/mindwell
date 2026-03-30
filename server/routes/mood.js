const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// ── Log Mood ───────────────────────────────────────────────────
router.post('/', authenticateToken, (req, res) => {
  try {
    const { mood_score, emoji, note } = req.body;

    if (!mood_score || mood_score < 1 || mood_score > 5) {
      return res.status(400).json({ error: 'Mood score must be 1-5.' });
    }

    db.prepare(
      'INSERT INTO mood_entries (user_id, mood_score, emoji, note) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, mood_score, emoji || '', note || '');

    // Update gamification
    const progress = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(req.user.id);
    if (progress) {
      const today = new Date().toISOString().split('T')[0];
      let newStreak = progress.streak_days;
      if (progress.last_checkin !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        newStreak = progress.last_checkin === yesterday ? progress.streak_days + 1 : 1;
      }
      const newXp = progress.xp + 10;
      const newLevel = Math.floor(newXp / 100) + 1;

      // Check for new badges
      let badges = JSON.parse(progress.badges || '[]');
      if (newStreak >= 3 && !badges.includes('streak-3')) badges.push('streak-3');
      if (newStreak >= 7 && !badges.includes('streak-7')) badges.push('streak-7');
      if (newStreak >= 30 && !badges.includes('streak-30')) badges.push('streak-30');
      if (newXp >= 100 && !badges.includes('xp-100')) badges.push('xp-100');
      if (newXp >= 500 && !badges.includes('xp-500')) badges.push('xp-500');

      db.prepare(
        'UPDATE user_progress SET xp = ?, level = ?, streak_days = ?, last_checkin = ?, badges = ? WHERE user_id = ?'
      ).run(newXp, newLevel, newStreak, today, JSON.stringify(badges), req.user.id);
    }

    // Log activity
    db.prepare('INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)').run(
      req.user.id, 'mood_checkin', `Mood: ${mood_score}/5`
    );

    res.status(201).json({ message: 'Mood recorded! +10 XP' });
  } catch (err) {
    console.error('Mood error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Get Mood History ───────────────────────────────────────────
router.get('/', authenticateToken, (req, res) => {
  try {
    const entries = db.prepare(
      'SELECT * FROM mood_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 30'
    ).all(req.user.id);

    res.json({ entries });
  } catch (err) {
    console.error('Mood history error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
