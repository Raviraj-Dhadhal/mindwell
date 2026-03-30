const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// ── Get Messages ───────────────────────────────────────────────
router.get('/messages', authenticateToken, (req, res) => {
  try {
    const room = req.query.room || 'general';
    const messages = db.prepare(
      `SELECT m.id, m.content, m.anonymous_name, m.created_at, m.room,
       CASE WHEN m.anonymous_name != '' THEN m.anonymous_name ELSE u.display_name END as sender_name,
       CASE WHEN m.anonymous_name != '' THEN '/assets/default-avatar.svg' ELSE u.avatar_url END as sender_avatar
       FROM messages m JOIN users u ON m.user_id = u.id
       WHERE m.room = ?
       ORDER BY m.created_at DESC LIMIT 50`
    ).all(room);

    res.json({ messages: messages.reverse() });
  } catch (err) {
    console.error('Messages error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Send Message ───────────────────────────────────────────────
router.post('/messages', authenticateToken, (req, res) => {
  try {
    const { content, room, anonymous } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const anonymousName = anonymous ? generateShadowName() : '';

    db.prepare(
      'INSERT INTO messages (user_id, room, content, anonymous_name) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, room || 'general', content.trim(), anonymousName);

    // Log activity
    db.prepare('INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)').run(
      req.user.id, 'message_sent', `Room: ${room || 'general'}${anonymous ? ' (anonymous)' : ''}`
    );

    // XP for participating
    db.prepare('UPDATE user_progress SET xp = xp + 5 WHERE user_id = ?').run(req.user.id);

    res.status(201).json({ message: 'Message sent! +5 XP' });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Generate Shadow Name ───────────────────────────────────────
function generateShadowName() {
  const adjectives = ['Calm', 'Brave', 'Gentle', 'Kind', 'Wise', 'Warm', 'Bold', 'Bright', 'Quiet', 'Swift', 'Peaceful', 'Strong'];
  const animals = ['Owl', 'Fox', 'Bear', 'Deer', 'Wolf', 'Eagle', 'Dolphin', 'Panda', 'Tiger', 'Rabbit', 'Falcon', 'Otter'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}${animal}${num}`;
}

module.exports = router;
