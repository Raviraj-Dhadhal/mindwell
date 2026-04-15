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

router.get('/assessment-report', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT summary_json, assessment_date FROM daily_assessments ORDER BY assessment_date DESC LIMIT 100'
    ).all();

    const today = new Date().toISOString().slice(0, 10);
    const keywordTotals = {};
    let submissionsToday = 0;

    for (const row of rows) {
      const summary = JSON.parse(row.summary_json);
      if (row.assessment_date === today) submissionsToday++;
      for (const keyword of summary.keywordPercentages || []) {
        keywordTotals[keyword.label] = (keywordTotals[keyword.label] || 0) + keyword.percentage;
      }
    }

    const keywords = Object.entries(keywordTotals)
      .map(([label, total]) => ({
        label,
        average: rows.length ? Math.round(total / rows.length) : 0
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 8);

    res.json({
      totalAssessments: rows.length,
      submissionsToday,
      keywords
    });
  } catch (err) {
    console.error('Assessment report error:', err);
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
    const assessmentHistory = db.prepare("SELECT 'assessment' as type, id, assessment_date, summary_json, created_at FROM daily_assessments WHERE user_id = ?").all(id)
      .map(item => ({ ...item, summary: JSON.parse(item.summary_json) }));

    const history = [...moodHistory, ...stressHistory, ...assessmentHistory]
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
