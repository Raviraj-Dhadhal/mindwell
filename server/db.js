const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mindwell.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Create Tables ──────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('user','admin')),
    display_name TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '/assets/default-avatar.svg',
    theme_pref TEXT DEFAULT 'light',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS mood_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mood_score INTEGER NOT NULL CHECK(mood_score BETWEEN 1 AND 5),
    emoji TEXT,
    note TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS stress_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('exams','social','family','financial','health','workload','other')),
    intensity INTEGER NOT NULL CHECK(intensity BETWEEN 1 AND 10),
    description TEXT DEFAULT '',
    is_anonymous INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    min_intensity INTEGER DEFAULT 1,
    max_intensity INTEGER DEFAULT 10,
    suggestion_text TEXT NOT NULL,
    resource_url TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    room TEXT DEFAULT 'general',
    content TEXT NOT NULL,
    anonymous_name TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_checkin DATE,
    badges TEXT DEFAULT '[]',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS support_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    admin_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (admin_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS daily_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    assessment_date DATE NOT NULL,
    question_count INTEGER NOT NULL DEFAULT 15,
    summary_json TEXT NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, assessment_date)
  );

  CREATE TABLE IF NOT EXISTS daily_assessment_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id INTEGER NOT NULL,
    question_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    option_key TEXT NOT NULL,
    option_text TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES daily_assessments(id) ON DELETE CASCADE
  );
`);

// ── Seed default suggestions ───────────────────────────────────
const existingSuggestions = db.prepare('SELECT COUNT(*) as count FROM suggestions').get();
if (existingSuggestions.count === 0) {
  const insert = db.prepare('INSERT INTO suggestions (category, min_intensity, max_intensity, suggestion_text, resource_url) VALUES (?, ?, ?, ?, ?)');

  const seeds = [
    ['exams', 1, 4, '📖 Try the Pomodoro technique — 25 min focused study, 5 min break. Small wins add up!', ''],
    ['exams', 5, 7, '🧘 Take a 5-minute breathing break before studying. Try our breathing exercise tool.', ''],
    ['exams', 8, 10, '🆘 High exam stress detected. Consider talking to a counselor. Meanwhile, break your study into tiny chunks.', ''],
    ['social', 1, 4, '💬 Join our community Shadow Chat — connect anonymously with peers who understand.', ''],
    ['social', 5, 7, '🤝 Try reaching out to one person today. Even a small conversation can help!', ''],
    ['social', 8, 10, '❤️ You\'re not alone. Our peer support groups are here for you 24/7.', ''],
    ['family', 1, 4, '📝 Journaling about your feelings can help process family dynamics.', ''],
    ['family', 5, 7, '🗣️ Consider sharing your feelings with a trusted friend or counselor.', ''],
    ['family', 8, 10, '🆘 Family stress is overwhelming. Please reach out to a professional counselor.', ''],
    ['financial', 1, 4, '💡 Check if your institution offers financial aid or emergency funds.', ''],
    ['financial', 5, 7, '📋 Create a simple budget. Track spending for one week to find areas to save.', ''],
    ['financial', 8, 10, '🆘 Severe financial stress can affect everything. Talk to your student services office.', ''],
    ['health', 1, 4, '🏃 Even 10 minutes of walking can boost your mood. Try it today!', ''],
    ['health', 5, 7, '😴 Are you sleeping enough? Aim for 7-8 hours. Try our sleep tips in Resources.', ''],
    ['health', 8, 10, '🆘 Your health is priority #1. Please visit your campus health center.', ''],
    ['workload', 1, 4, '📅 Use our Study Planner to organize tasks by priority.', ''],
    ['workload', 5, 7, '⚡ Break large tasks into 15-min chunks. Celebrate each completion!', ''],
    ['workload', 8, 10, '🆘 Overloaded? Talk to your professor or advisor about deadline extensions.', ''],
    ['other', 1, 5, '🌟 Whatever you\'re going through, taking it one step at a time helps.', ''],
    ['other', 6, 10, '💜 Reach out — our community and resources are here to support you.', '']
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) insert.run(...item);
  });
  insertMany(seeds);
}

// ── Seed admin user ────────────────────────────────────────────
const bcrypt = require('bcryptjs');
const existingAdmin = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin');
if (existingAdmin.count === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, email, password_hash, role, display_name) VALUES (?, ?, ?, ?, ?)').run('admin', 'admin@mindwell.com', hash, 'admin', 'Admin');
  console.log('✅ Default admin created — username: admin, password: admin123');
}

module.exports = db;
