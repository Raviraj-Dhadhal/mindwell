/* ============================================================
   MindWell - dashboard.js
   Mood tracking, daily assessment, stress sharing, progress tools
   ============================================================ */

let selectedMoodScore = null;
let selectedStressCat = null;
let breathingInterval = null;
let pomodoroInterval = null;
let pomodoroSeconds = 25 * 60;
let pomodoroRunning = false;
let moodChart = null;
let assessmentChart = null;
let dailyQuestions = [];
let assessmentAnswers = {};

document.addEventListener('DOMContentLoaded', async () => {
  const user = API.getUser();
  if (user) {
    const el = document.getElementById('dashDisplayName');
    if (el) el.textContent = user.display_name || user.username;
  }

  await Promise.all([
    loadAssessmentToday(),
    loadAssessmentLatest(),
    loadMoodHistory(),
    loadProgress(),
    loadActivityHistory(),
    checkAdminSupport()
  ]);
});

function selectMood(el) {
  document.querySelectorAll('.mood-option').forEach(option => option.classList.remove('selected'));
  el.classList.add('selected');
  selectedMoodScore = parseInt(el.dataset.score, 10);
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
    const selected = document.querySelector('.mood-option.selected');
    const data = await API.post('/mood', {
      mood_score: selectedMoodScore,
      emoji: selected ? selected.dataset.emoji : '',
      note: document.getElementById('moodNote').value
    });

    showToast(data.message, 'success');
    document.getElementById('moodNote').value = '';
    document.querySelectorAll('.mood-option').forEach(option => option.classList.remove('selected'));
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
  const labels = sorted.map(entry => {
    const date = new Date(entry.created_at);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  const scores = sorted.map(entry => entry.mood_score);

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
        pointBackgroundColor: scores.map(score => (
          score <= 2 ? '#EF4444' : score === 3 ? '#F59E0B' : '#34D399'
        )),
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          min: 0,
          max: 6,
          ticks: {
            stepSize: 1,
            callback: value => ['', '😢', '😟', '😐', '😊', '🤩'][value] || ''
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

async function loadAssessmentToday() {
  try {
    const data = await API.get('/assessment/today');
    if (!data) return;

    dailyQuestions = data.questions || [];
    assessmentAnswers = {};

    const status = document.getElementById('assessmentStatus');
    if (status) status.textContent = data.completed ? 'Completed today' : 'Pending today';

    if (data.completed && data.summary) {
      renderCompletedAssessmentState(data.summary);
      return;
    }

    renderAssessmentQuestions(dailyQuestions);
  } catch (err) {
    console.error('Assessment load error:', err);
  }
}

function renderAssessmentQuestions(questions) {
  const container = document.getElementById('assessmentQuestions');
  if (!container) return;

  if (!questions.length) {
    container.innerHTML = '<p class="empty-state">No questions available right now.</p>';
    return;
  }

  container.innerHTML = questions.map((question, index) => `
    <div class="assessment-question">
      <div class="assessment-question-head">
        <span class="assessment-question-index">Question ${index + 1}</span>
        <span class="assessment-question-category">${question.category}</span>
      </div>
      <div class="assessment-question-title">${question.question}</div>
      <div class="assessment-options">
        ${question.options.map(option => `
          <button
            type="button"
            class="assessment-option"
            data-question-id="${question.id}"
            data-option-key="${option.key}"
            onclick="selectAssessmentOption('${question.id}', '${option.key}', this)"
          >
            <span class="assessment-option-key">${option.key}</span>${option.text}
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderCompletedAssessmentState(summary) {
  const form = document.getElementById('assessmentForm');
  if (!form) return;

  form.innerHTML = `
    <div class="suggestion-item">
      Your reflection for today is already saved. Top pattern: <strong>${summary.summaryLabel}</strong>.
    </div>
  `;
}

function selectAssessmentOption(questionId, optionKey, button) {
  assessmentAnswers[questionId] = optionKey;
  document.querySelectorAll(`.assessment-option[data-question-id="${questionId}"]`)
    .forEach(option => option.classList.remove('active'));
  button.classList.add('active');
}

async function submitAssessment() {
  if (!dailyQuestions.length) return;

  const missing = dailyQuestions.filter(question => !assessmentAnswers[question.id]);
  if (missing.length) {
    showToast(`Please answer all 15 questions. ${missing.length} left.`, 'warning');
    return;
  }

  const btn = document.getElementById('assessmentSubmitBtn');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  try {
    const data = await API.post('/assessment/submit', {
      answers: dailyQuestions.map(question => ({
        question_id: question.id,
        option_key: assessmentAnswers[question.id]
      }))
    });

    showToast(data.message, 'success');
    renderCompletedAssessmentState(data.summary);
    const status = document.getElementById('assessmentStatus');
    if (status) status.textContent = 'Completed today';

    renderAssessmentSummary(data.summary);
    await loadAssessmentHistory();
    await loadProgress();
    await loadActivityHistory();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.textContent = 'Save Daily Reflection →';
    btn.disabled = false;
  }
}

async function loadAssessmentLatest() {
  try {
    const latest = await API.get('/assessment/latest');
    if (latest?.entry?.summary) {
      renderAssessmentSummary(latest.entry.summary);
    }
    await loadAssessmentHistory();
  } catch (err) {
    console.error('Assessment latest error:', err);
  }
}

async function loadAssessmentHistory() {
  try {
    const data = await API.get('/assessment/history');
    const history = document.getElementById('assessmentHistory');
    if (!history) return;

    if (!data?.entries?.length) {
      history.innerHTML = '<p class="empty-state">No daily reflections yet.</p>';
      return;
    }

    history.innerHTML = data.entries.slice(0, 4).map(entry => `
      <div class="assessment-history-item">
        <span>${new Date(entry.assessment_date).toLocaleDateString()}</span>
        <strong>${entry.summary.summaryLabel}</strong>
      </div>
    `).join('');
  } catch (err) {
    console.error('Assessment history error:', err);
  }
}

function renderAssessmentSummary(summary) {
  renderAssessmentChart(summary.keywordPercentages || []);

  const grid = document.getElementById('keywordGrid');
  if (!grid) return;

  if (!summary.topKeywords?.length) {
    grid.innerHTML = '<p class="empty-state">No keyword data yet.</p>';
    return;
  }

  grid.innerHTML = summary.topKeywords.map(item => `
    <div class="keyword-card">
      <div class="keyword-card-label">${item.label}</div>
      <div class="keyword-card-value" style="color:${item.color};">${item.percentage}%</div>
    </div>
  `).join('');
}

function renderAssessmentChart(items) {
  const canvas = document.getElementById('assessmentChart');
  if (!canvas) return;

  if (assessmentChart) assessmentChart.destroy();

  if (!items.length) {
    return;
  }

  assessmentChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: items.map(item => item.label),
      datasets: [{
        data: items.map(item => item.percentage),
        backgroundColor: items.map(item => item.color),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function selectStressCat(el) {
  document.querySelectorAll('.stress-cat').forEach(button => button.classList.remove('selected'));
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
      intensity: parseInt(document.getElementById('intensitySlider').value, 10),
      description: document.getElementById('stressDesc').value,
      is_anonymous: document.getElementById('stressAnonymous').checked
    });

    showToast(data.message, 'success');

    if (data.suggestions && data.suggestions.length > 0) {
      const card = document.getElementById('suggestionsCard');
      const list = document.getElementById('suggestionsList');
      card.style.display = 'block';
      list.innerHTML = data.suggestions.map(item => `
        <div class="suggestion-item">${item.suggestion_text}</div>
      `).join('');
    }

    document.getElementById('stressDesc').value = '';
    document.querySelectorAll('.stress-cat').forEach(button => button.classList.remove('selected'));
    selectedStressCat = null;

    await loadProgress();
    await loadActivityHistory();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadProgress() {
  try {
    const data = await API.get('/profile');
    if (!data) return;

    const progress = data.progress || {};
    const level = progress.level || 1;
    const xp = progress.xp || 0;
    const streak = progress.streak_days || 0;
    const badges = JSON.parse(progress.badges || '[]');

    document.getElementById('userLevel').textContent = `Lv. ${level}`;
    document.getElementById('userXp').textContent = xp;
    document.getElementById('currentLevel').textContent = level;
    document.getElementById('nextLevel').textContent = level + 1;
    document.getElementById('streakDays').textContent = streak;
    document.getElementById('xpBar').style.width = `${xp % 100}%`;

    const badgeMap = {
      'streak-3': '🔥 3-Day Streak',
      'streak-7': '🔥 7-Day Streak',
      'streak-30': '🔥 30-Day Streak',
      'xp-100': '⭐ 100 XP',
      'xp-500': '⭐ 500 XP'
    };

    const grid = document.getElementById('badgesGrid');
    if (grid) {
      grid.innerHTML = Object.entries(badgeMap).map(([key, label]) => `
        <div class="badge-item ${badges.includes(key) ? 'earned' : ''}">${label}</div>
      `).join('');
    }
  } catch (err) {
    console.error('Load progress error:', err);
  }
}

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
    { text: 'Inhale...', cls: 'inhale' },
    { text: 'Hold...', cls: 'inhale' },
    { text: 'Exhale...', cls: 'exhale' }
  ];

  function nextPhase() {
    const current = phases[phase % phases.length];
    circle.textContent = current.text;
    circle.classList.remove('inhale', 'exhale');
    circle.classList.add(current.cls);
    phase++;
  }

  nextPhase();
  breathingInterval = setInterval(nextPhase, 4000);
}

function updatePomodoroDisplay() {
  const minutes = Math.floor(pomodoroSeconds / 60);
  const seconds = pomodoroSeconds % 60;
  document.getElementById('pomodoroTime').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
      showToast('Pomodoro complete! Take a 5-minute break.', 'success');
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
    if (!data?.history?.length) {
      list.innerHTML = '<p class="empty-state">No recent activity recorded. Check in today!</p>';
      return;
    }

    list.innerHTML = data.history.map(item => {
      if (item.type === 'assessment') {
        const top = item.summary?.summaryLabel || 'Mind Scan';
        return `
          <div style="padding:var(--space-md); border:1px solid var(--border-light); border-radius:var(--radius-md); margin-bottom:var(--space-sm); background:var(--bg-alt);">
            <div style="display:flex; justify-content:space-between; margin-bottom:var(--space-xs); gap:var(--space-sm);">
              <strong>🧠 Daily Mind Scan</strong>
              <span style="font-size:0.75rem; color:var(--text-muted);">${new Date(item.created_at).toLocaleString()}</span>
            </div>
            <div style="font-size:0.9rem;">Top pattern: ${top}</div>
          </div>
        `;
      }

      const isMood = item.type === 'mood';
      const icon = isMood ? '😊' : '🎯';
      return `
        <div style="padding:var(--space-md); border:1px solid var(--border-light); border-radius:var(--radius-md); margin-bottom:var(--space-sm); background:var(--bg-alt);">
          <div style="display:flex; justify-content:space-between; margin-bottom:var(--space-xs); gap:var(--space-sm);">
            <strong>${icon} ${isMood ? 'Mood Check' : 'Stress Shared'}</strong>
            <span style="font-size:0.75rem; color:var(--text-muted);">${new Date(item.created_at).toLocaleString()}</span>
          </div>
          <div style="font-size:0.9rem;">
            ${isMood ? `Mood Score: ${item.mood_score}/5 · emoji: ${item.emoji}` : `Category: ${item.category} · Intensity: ${item.intensity}/10`}
          </div>
          ${item.note || item.description ? `<div style="margin-top:var(--space-xs); font-style:italic; font-size:0.85rem; color:var(--text-secondary);">"${item.note || item.description}"</div>` : ''}
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
    if (data?.note) {
      document.getElementById('supportNoticeCard').style.display = 'block';
      document.getElementById('supportNoteText').textContent = data.note.message;
    }
  } catch (err) {
    console.error('Error checking support:', err);
  }
}
