const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require both auth + admin role
router.use(authenticateToken, requireAdmin);

// ── Get All Users ──────────────────────────────────────────────
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(
      'SELECT id, username, email, role, display_name, avatar_url, created_at FROM users ORDER BY created_at DESC'
    ).all();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Get Activity Log ───────────────────────────────────────────
router.get('/activity', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = db.prepare(
      `SELECT a.*, u.username, u.display_name 
       FROM activity_log a 
       LEFT JOIN users u ON a.user_id = u.id 
       ORDER BY a.created_at DESC LIMIT ?`
    ).all(limit);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Stress Report (Aggregated) ─────────────────────────────────
router.get('/stress-report', (req, res) => {
  try {
    const byCategory = db.prepare(
      'SELECT category, COUNT(*) as count, AVG(intensity) as avg_intensity FROM stress_points GROUP BY category ORDER BY count DESC'
    ).all();

    const byDay = db.prepare(
      `SELECT DATE(created_at) as date, COUNT(*) as count, AVG(intensity) as avg_intensity 
       FROM stress_points 
       WHERE created_at >= datetime('now', '-30 days')
       GROUP BY DATE(created_at) ORDER BY date`
    ).all();

    const highStress = db.prepare(
      'SELECT COUNT(*) as count FROM stress_points WHERE intensity >= 8'
    ).get();

    res.json({ byCategory, byDay, highStress: highStress.count });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Dashboard Stats ────────────────────────────────────────────
router.get('/stats', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('user');
    const totalMoodEntries = db.prepare('SELECT COUNT(*) as count FROM mood_entries').get();
    const totalStressShares = db.prepare('SELECT COUNT(*) as count FROM stress_points').get();
    const totalMessages = db.prepare('SELECT COUNT(*) as count FROM messages').get();
    const avgMood = db.prepare('SELECT AVG(mood_score) as avg FROM mood_entries').get();
    const todayLogins = db.prepare(
      "SELECT COUNT(*) as count FROM activity_log WHERE action = 'login' AND DATE(created_at) = DATE('now')"
    ).get();

    res.json({
      totalUsers: totalUsers.count,
      totalMoodEntries: totalMoodEntries.count,
      totalStressShares: totalStressShares.count,
      totalMessages: totalMessages.count,
      avgMood: avgMood.avg ? parseFloat(avgMood.avg).toFixed(1) : 'N/A',
      todayLogins: todayLogins.count
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Improved User Monitoring ───────────────────────────────────
router.get('/user-details/:id', (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[MindWell ADMIN] Request details for Student ID: ${id}`);
    
    const user = db.prepare(
      'SELECT id, username, email, role, display_name, avatar_url, created_at FROM users WHERE id = ?'
    ).get(id);

    if (!user) {
      return res.status(404).json({ error: 'Student profile not found in database.' });
    }

    // Combined History fetch
    const moodHistory = db.prepare("SELECT 'mood' as type, id, mood_score, emoji, note, created_at FROM mood_entries WHERE user_id = ?").all(id);
    const stressHistory = db.prepare("SELECT 'stress' as type, id, category, intensity, description, created_at FROM stress_points WHERE user_id = ?").all(id);

    const history = [...moodHistory, ...stressHistory]
      .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50);

    console.log(`[MindWell ADMIN] Sending profile + ${history.length} events for ${user.username}`);
    res.json({ user, history });
  } catch (err) {
    console.error('[MindWell ADMIN ERROR]:', err);
    res.status(500).json({ error: 'DB_ERROR: ' + err.message });
  }
});

// ── Send Support Note ──────────────────────────────────────────
router.post('/user/:id/support', (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const adminId = req.user.id;

    if (!message) return res.status(400).json({ error: 'Message required.' });

    db.prepare(
      'INSERT INTO support_notes (user_id, admin_id, message) VALUES (?, ?, ?)'
    ).run(id, adminId, message);

    res.json({ success: true, message: 'Support note sent successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
