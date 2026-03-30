/* ============================================================
   MindWell — dashboard.js
   Mood tracking, stress sharing, gamification, breathing, pomodoro
   ============================================================ */

let selectedMoodScore = null;
let selectedStressCat = null;
let breathingInterval = null;
let pomodoroInterval = null;
let pomodoroSeconds = 25 * 60;
let pomodoroRunning = false;
let moodChart = null;

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const user = API.getUser();
  if (user) {
    const el = document.getElementById('dashDisplayName');
    if (el) el.textContent = user.display_name || user.username;
  }

  await loadMoodHistory();
  await loadProgress();
  await loadActivityHistory();
  await checkAdminSupport();
});

// ── Mood ────────────────────────────────────────────────────
function selectMood(el) {
  document.querySelectorAll('.mood-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedMoodScore = parseInt(el.dataset.score);
}

async function submitMood() {
  if (!selectedMoodScore) {
    showToast('Please select a mood first!', 'warning');
    return;
  }

  const btn = document.getElementById('moodSubmitBtn');
  btn.textContent = 'Recording...';
  btn.disabled = true;

  try {
    const el = document.querySelector('.mood-option.selected');
    const data = await API.post('/mood', {
      mood_score: selectedMoodScore,
      emoji: el ? el.dataset.emoji : '',
      note: document.getElementById('moodNote').value
    });

    showToast(data.message, 'success');
    document.getElementById('moodNote').value = '';
    document.querySelectorAll('.mood-option').forEach(o => o.classList.remove('selected'));
    selectedMoodScore = null;

    await loadMoodHistory();
    await loadProgress();
    await loadActivityHistory();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.textContent = 'Record Mood →';
    btn.disabled = false;
  }
}

async function loadMoodHistory() {
  try {
    const data = await API.get('/mood');
    if (!data) return;
    renderMoodChart(data.entries);
    const el = document.getElementById('totalCheckins');
    if (el) el.textContent = data.entries.length;
  } catch (err) {
    console.error('Load mood error:', err);
  }
}

function renderMoodChart(entries) {
  const canvas = document.getElementById('moodChart');
  if (!canvas) return;

  const sorted = [...entries].reverse();
  const labels = sorted.map(e => {
    const d = new Date(e.created_at);
    return `${d.getMonth()+1}/${d.getDate()}`;
  });
  const scores = sorted.map(e => e.mood_score);

  if (moodChart) moodChart.destroy();

  moodChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Mood Score',
        data: scores,
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: scores.map(s =>
          s <= 2 ? '#EF4444' : s === 3 ? '#F59E0B' : '#34D399'
        ),
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1F2937',
          titleColor: '#F9FAFB',
          bodyColor: '#F9FAFB',
          padding: 12,
          callbacks: {
            label: ctx => {
              const emojis = ['', '😢', '😟', '😐', '😊', '🤩'];
              return ` ${emojis[ctx.raw]} Mood: ${ctx.raw}/5`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 0, max: 6,
          ticks: {
            stepSize: 1,
            callback: v => ['', '😢', '😟', '😐', '😊', '🤩'][v] || ''
          },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

// ── Stress ──────────────────────────────────────────────────
function selectStressCat(el) {
  document.querySelectorAll('.stress-cat').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  selectedStressCat = el.dataset.cat;
}

async function submitStress() {
  if (!selectedStressCat) {
    showToast('Please select a stress category!', 'warning');
    return;
  }

  try {
    const data = await API.post('/stress', {
      category: selectedStressCat,
      intensity: parseInt(document.getElementById('intensitySlider').value),
      description: document.getElementById('stressDesc').value,
      is_anonymous: document.getElementById('stressAnonymous').checked
    });

    showToast(data.message, 'success');

    if (data.suggestions && data.suggestions.length > 0) {
      const card = document.getElementById('suggestionsCard');
      const list = document.getElementById('suggestionsList');
      card.style.display = 'block';
      list.innerHTML = data.suggestions.map(s =>
        `<div class="suggestion-item">${s.suggestion_text}</div>`
      ).join('');
    }

    document.getElementById('stressDesc').value = '';
    document.querySelectorAll('.stress-cat').forEach(b => b.classList.remove('selected'));
    selectedStressCat = null;

    await loadProgress();
    await loadActivityHistory();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Gamification ────────────────────────────────────────────
async function loadProgress() {
  try {
    const data = await API.get('/profile');
    if (!data) return;

    const p = data.progress || {};
    const level = p.level || 1;
    const xp = p.xp || 0;
    const streak = p.streak_days || 0;
    const badges = JSON.parse(p.badges || '[]');

    document.getElementById('userLevel').textContent = `Lv. ${level}`;
    document.getElementById('userXp').textContent = xp;
    document.getElementById('currentLevel').textContent = level;
    document.getElementById('nextLevel').textContent = level + 1;
    document.getElementById('streakDays').textContent = streak;

    const xpInLevel = xp % 100;
    document.getElementById('xpBar').style.width = `${xpInLevel}%`;

    // Update badges
    const badgeMap = {
      'streak-3': '🔥 3-Day Streak',
      'streak-7': '🔥 7-Day Streak',
      'streak-30': '🔥 30-Day Streak',
      'xp-100': '⭐ 100 XP',
      'xp-500': '⭐ 500 XP'
    };

    const grid = document.getElementById('badgesGrid');
    if (grid) {
      grid.innerHTML = Object.entries(badgeMap).map(([key, label]) =>
        `<div class="badge-item ${badges.includes(key) ? 'earned' : ''}">${label}</div>`
      ).join('');
    }
  } catch (err) {
    console.error('Load progress error:', err);
  }
}

// ── Breathing Exercise ──────────────────────────────────────
function startBreathing() {
  const circle = document.getElementById('breathCircle');
  const btn = document.getElementById('breathBtn');

  if (breathingInterval) {
    clearInterval(breathingInterval);
    breathingInterval = null;
    circle.textContent = 'Breathe';
    circle.classList.remove('inhale', 'exhale');
    btn.textContent = 'Start 4-7-8';
    return;
  }

  btn.textContent = 'Stop';
  let phase = 0;
  const phases = [
    { text: 'Inhale...', duration: 4000, cls: 'inhale' },
    { text: 'Hold...', duration: 7000, cls: 'inhale' },
    { text: 'Exhale...', duration: 8000, cls: 'exhale' }
  ];

  function nextPhase() {
    const p = phases[phase % 3];
    circle.textContent = p.text;
    circle.classList.remove('inhale', 'exhale');
    circle.classList.add(p.cls);
    phase++;
  }

  nextPhase();
  breathingInterval = setInterval(nextPhase, 4000);
}

// ── Pomodoro Timer ──────────────────────────────────────────
function updatePomodoroDisplay() {
  const minutes = Math.floor(pomodoroSeconds / 60);
  const seconds = pomodoroSeconds % 60;
  document.getElementById('pomodoroTime').textContent =
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function togglePomodoro() {
  const btn = document.getElementById('pomodoroBtn');

  if (pomodoroRunning) {
    clearInterval(pomodoroInterval);
    pomodoroRunning = false;
    btn.textContent = 'Resume';
    return;
  }

  pomodoroRunning = true;
  btn.textContent = 'Pause';

  pomodoroInterval = setInterval(() => {
    pomodoroSeconds--;
    updatePomodoroDisplay();

    if (pomodoroSeconds <= 0) {
      clearInterval(pomodoroInterval);
      pomodoroRunning = false;
      showToast('⏱️ Pomodoro complete! Take a 5-minute break.', 'success');
      pomodoroSeconds = 5 * 60;
      document.getElementById('pomodoroLabel').textContent = 'Break Time!';
      btn.textContent = 'Start Break';
      updatePomodoroDisplay();
    }
  }, 1000);
}

function resetPomodoro() {
  clearInterval(pomodoroInterval);
  pomodoroRunning = false;
  pomodoroSeconds = 25 * 60;
  document.getElementById('pomodoroLabel').textContent = 'Focus Time';
  document.getElementById('pomodoroBtn').textContent = 'Start';
  updatePomodoroDisplay();
}
async function loadActivityHistory() {
  try {
    const list = document.getElementById('userActivityList');
    if (!list) return;

    const data = await API.get('/profile/history');
    if (!data || !data.history || data.history.length === 0) {
      list.innerHTML = '<p class="empty-state">No recent activity recorded. Check in today!</p>';
      return;
    }

    list.innerHTML = data.history.map(h => {
      const isMood = h.type === 'mood';
      const icon = isMood ? '😊' : '🎯';
      return `
        <div style="padding:var(--space-md); border:1px solid var(--border-light); border-radius:var(--radius-md); margin-bottom:var(--space-sm); background:var(--bg-alt);">
          <div style="display:flex; justify-content:space-between; margin-bottom:var(--space-xs);">
            <strong>${icon} ${isMood ? 'Mood Check' : 'Stress Shared'}</strong>
            <span style="font-size:0.75rem; color:var(--text-muted);">${new Date(h.created_at).toLocaleString()}</span>
          </div>
          <div style="font-size:0.9rem;">
            ${isMood ? `Mood Score: ${h.mood_score}/5 · emoji: ${h.emoji}` : `Category: ${h.category} · Intensity: ${h.intensity}/10`}
          </div>
          ${h.note || h.description ? `<div style="margin-top:var(--space-xs); font-style:italic; font-size:0.85rem; color:var(--text-secondary);">"${h.note || h.description}"</div>` : ''}
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading history:', err);
  }
}

async function checkAdminSupport() {
  try {
    const data = await API.get('/profile/support-notes');
    if (data && data.note) {
      document.getElementById('supportNoticeCard').style.display = 'block';
      document.getElementById('supportNoteText').textContent = data.note.message;
    }
  } catch (err) {
    console.error('Error checking support:', err);
  }
}
