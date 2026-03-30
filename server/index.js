const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize database (creates tables + seeds)
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/stress', require('./routes/stress'));
app.use('/api/community', require('./routes/community'));
app.use('/api/admin', require('./routes/admin'));

// ── Catch-all: serve index.html for unmatched routes ───────────
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Start Server ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║   🧠 MindWell Server Running!            ║
  ║                                          ║
  ║   🌐 http://localhost:${PORT}              ║
  ║   📊 Admin: admin / admin123             ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
  `);
});
