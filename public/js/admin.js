/* ============================================================
   MindWell - admin.js
   Admin dashboard for users, activity logs, stress analytics, assessments
   ============================================================ */

let adminAssessmentChart = null;

document.addEventListener('DOMContentLoaded', () => {
  loadAdminStats();
  loadUsers();
});

function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.admin-panel').forEach(panel => panel.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`panel-${tab}`).classList.add('active');

  if (tab === 'users') loadUsers();
  if (tab === 'activity') loadActivity();
  if (tab === 'stress') loadStressReport();
  if (tab === 'assessment') loadAssessmentReport();
}

async function loadAdminStats() {
  try {
    const data = await API.get('/admin/stats');
    if (!data) return;

    document.getElementById('sTotalUsers').textContent = data.totalUsers;
    document.getElementById('sTotalMood').textContent = data.totalMoodEntries;
    document.getElementById('sTotalStress').textContent = data.totalStressShares;
    document.getElementById('sAvgMood').textContent = data.avgMood;
  } catch (err) {
    console.error('Admin stats error:', err);
  }
}

async function loadUsers() {
  try {
    const data = await API.get('/admin/users');
    if (!data) return;

    const tbody = document.getElementById('usersTableBody');
    if (!data.users.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No users found</td></tr>';
      return;
    }

    tbody.innerHTML = data.users.map(user => `
      <tr>
        <td>${user.id}</td>
        <td>
          <div style="display:flex; align-items:center; gap:var(--space-sm);">
            <img src="${user.avatar_url || '/assets/default-avatar.svg'}" style="width:28px; height:28px; border-radius:50%;" alt="">
            ${user.display_name || user.username}
          </div>
        </td>
        <td>${user.email}</td>
        <td><span class="tag ${user.role === 'admin' ? 'purple' : ''}">${user.role}</span></td>
        <td>${new Date(user.created_at).toLocaleDateString()}</td>
        <td><button class="btn btn-sm btn-ghost" onclick="viewUserDetails(${user.id}, '${(user.display_name || user.username).replace(/'/g, "\\'")}')">View</button></td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Load users error:', err);
  }
}

async function loadActivity() {
  try {
    const data = await API.get('/admin/activity?limit=100');
    if (!data) return;

    const tbody = document.getElementById('activityTableBody');
    if (!data.logs?.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No activity yet</td></tr>';
      return;
    }

    tbody.innerHTML = data.logs.map(log => `
      <tr>
        <td style="font-size:0.8rem; white-space:nowrap;">${new Date(log.created_at).toLocaleString()}</td>
        <td>${log.display_name || log.username || 'Unknown'}</td>
        <td><span class="tag">${log.action}</span></td>
        <td style="font-size:0.85rem; color:var(--text-secondary);">${log.details || ''}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Load activity error:', err);
  }
}

async function loadStressReport() {
  try {
    const data = await API.get('/admin/stress-report');
    if (!data) return;

    document.getElementById('highStressCount').textContent = data.highStress || 0;
    const container = document.getElementById('stressByCategoryChart');

    if (!data.byCategory?.length) {
      container.innerHTML = '<div class="empty-state"><p>No stress data yet</p></div>';
      return;
    }

    const maxCount = Math.max(...data.byCategory.map(item => item.count));
    container.innerHTML = data.byCategory.map(item => {
      const pct = Math.round((item.count / maxCount) * 100);
      const avgInt = parseFloat(item.avg_intensity).toFixed(1);
      return `
        <div style="margin-bottom:var(--space-md);">
          <div style="display:flex; justify-content:space-between; gap:var(--space-sm); font-size:0.85rem; margin-bottom:4px;">
            <span>${item.category}</span>
            <span style="color:var(--text-muted);">${item.count} entries · avg ${avgInt}/10</span>
          </div>
          <div style="background:var(--bg-alt); border-radius:var(--radius-full); height:10px; overflow:hidden;">
            <div style="height:100%; width:${pct}%; background:var(--gradient-primary); border-radius:var(--radius-full);"></div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Load stress report error:', err);
  }
}

async function loadAssessmentReport() {
  try {
    const data = await API.get('/admin/assessment-report');
    if (!data) return;

    document.getElementById('assessmentTotal').textContent = data.totalAssessments || 0;
    document.getElementById('assessmentToday').textContent = data.submissionsToday || 0;

    const grid = document.getElementById('adminKeywordGrid');
    if (!data.keywords?.length) {
      grid.innerHTML = '<p class="empty-state">No assessment data yet.</p>';
      renderAdminAssessmentChart([]);
      return;
    }

    grid.innerHTML = data.keywords.map(item => `
      <div class="keyword-card">
        <div class="keyword-card-label">${item.label}</div>
        <div class="keyword-card-value">${item.average}%</div>
      </div>
    `).join('');

    renderAdminAssessmentChart(data.keywords);
  } catch (err) {
    console.error('Load assessment report error:', err);
  }
}

function renderAdminAssessmentChart(items) {
  const canvas = document.getElementById('adminAssessmentChart');
  if (!canvas) return;
  if (adminAssessmentChart) adminAssessmentChart.destroy();
  if (!items.length) return;

  const palette = ['#34D399', '#F97316', '#3B82F6', '#06B6D4', '#8B5CF6', '#F59E0B', '#EF4444', '#14B8A6'];
  adminAssessmentChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: items.map(item => item.label),
      datasets: [{
        data: items.map(item => item.average),
        backgroundColor: items.map((_, index) => palette[index % palette.length]),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

async function viewUserDetails(id, name) {
  document.getElementById('modalUserName').textContent = `User: ${name}`;
  document.getElementById('userDetailModal').classList.add('active');
  document.getElementById('userHistoryList').innerHTML = '<p class="empty-state">Loading history...</p>';
  document.getElementById('userCreds').innerHTML = 'Loading credentials info...';

  try {
    const data = await API.get(`/admin/user-details/${id}`);
    if (!data) return;

    const list = document.getElementById('userHistoryList');
    if (!data.history?.length) {
      list.innerHTML = '<p class="empty-state">No recent wellness records for this user.</p>';
    } else {
      list.innerHTML = data.history.map(item => {
        if (item.type === 'assessment') {
          const top = item.summary?.summaryLabel || 'Mind Scan';
          const keywordText = (item.summary?.topKeywords || []).slice(0, 3).map(keyword => `${keyword.percentage}% ${keyword.label}`).join(' · ');
          return `
            <div style="padding:var(--space-md); border-bottom:1px solid var(--border-light); font-size:0.85rem;">
              <div style="display:flex; justify-content:space-between; gap:var(--space-sm); margin-bottom:4px;">
                <strong>🧠 Daily Mind Scan</strong>
                <span style="color:var(--text-muted); font-size:0.75rem;">${new Date(item.created_at).toLocaleString()}</span>
              </div>
              <div style="color:var(--text-secondary);">Top pattern: <span style="font-weight:600; color:var(--primary);">${top}</span></div>
              <div style="margin-top:8px; padding:var(--space-xs) var(--space-sm); background:var(--bg-alt); border-radius:var(--radius-sm);">${keywordText || 'No keyword data'}</div>
            </div>
          `;
        }

        return `
          <div style="padding:var(--space-md); border-bottom:1px solid var(--border-light); font-size:0.85rem;">
            <div style="display:flex; justify-content:space-between; gap:var(--space-sm); margin-bottom:4px;">
              <strong>${item.type === 'mood' ? '😊 Mood Check' : '🎯 Stress Share'}</strong>
              <span style="color:var(--text-muted); font-size:0.75rem;">${new Date(item.created_at).toLocaleString()}</span>
            </div>
            <div style="color:var(--text-secondary);">
              ${item.type === 'mood'
                ? `Comfort Level: <span style="font-weight:600; color:var(--primary);">${item.mood_score}/5</span> · ${item.emoji || ''}`
                : `Category: <span style="font-weight:600; color:var(--accent-dark);">${item.category}</span> · Intensity: <span style="font-weight:600; color:var(--danger);">${item.intensity}/10</span>`}
            </div>
            ${item.note || item.description ? `<div style="margin-top:8px; padding:var(--space-xs) var(--space-sm); background:var(--bg-alt); border-radius:var(--radius-sm); font-style:italic;">"${item.note || item.description}"</div>` : ''}
          </div>
        `;
      }).join('');
    }

    document.getElementById('userCreds').innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px;">
        <p><strong>Username:</strong> ${data.user.username}</p>
        <p><strong>Email:</strong> ${data.user.email}</p>
        <p><strong>Database ID:</strong> #MW-${String(data.user.id).padStart(4, '0')}</p>
        <p><strong>Member Since:</strong> ${new Date(data.user.created_at).toLocaleDateString()}</p>
      </div>
    `;

    document.getElementById('sendHelpBtn').onclick = () => sendSupportNote(id);
  } catch (err) {
    console.error('Error fetching user details:', err);
    document.getElementById('userHistoryList').innerHTML = `<p class="error" style="color:var(--danger); padding:var(--space-md); text-align:center;">Error: ${err.message}</p>`;
    document.getElementById('userCreds').innerHTML = '<span style="color:var(--danger); font-size:0.8rem;">Could not load credentials info.</span>';
  }
}

function closeUserModal() {
  document.getElementById('userDetailModal').classList.remove('active');
}

async function sendSupportNote(userId) {
  const note = document.getElementById('adminNote').value;
  if (!note) {
    showToast('Please enter a note!', 'warning');
    return;
  }

  try {
    await API.post(`/admin/user/${userId}/support`, { message: note });
    showToast('Support note sent to user dashboard!', 'success');
    document.getElementById('adminNote').value = '';
    closeUserModal();
  } catch (err) {
    showToast('Failed to send support note.', 'error');
  }
}
