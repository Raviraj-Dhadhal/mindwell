/* ============================================================
   MindWell — admin.js
   Admin dashboard — users, activity logs, stress reports
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  loadAdminStats();
  loadUsers();
});

function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`panel-${tab}`).classList.add('active');

  if (tab === 'users') loadUsers();
  if (tab === 'activity') loadActivity();
  if (tab === 'stress') loadStressReport();
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
    if (data.users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No users found</td></tr>';
      return;
    }

    tbody.innerHTML = data.users.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>
          <div style="display:flex; align-items:center; gap:var(--space-sm);">
            <img src="${u.avatar_url || '/assets/default-avatar.svg'}" style="width:28px; height:28px; border-radius:50%;" alt="">
            ${u.display_name || u.username}
          </div>
        </td>
        <td>${u.email}</td>
        <td><span class="tag ${u.role === 'admin' ? 'purple' : ''}">${u.role}</span></td>
        <td>${new Date(u.created_at).toLocaleDateString()}</td>
        <td><button class="btn btn-sm btn-ghost" onclick="viewUserDetails(${u.id}, '${u.display_name || u.username}')">🔍 View</button></td>
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
    if (!data.logs || data.logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No activity yet</td></tr>';
      return;
    }

    tbody.innerHTML = data.logs.map(log => {
      const time = new Date(log.created_at).toLocaleString();
      const actionColors = {
        'login': 'green',
        'register': 'purple',
        'mood_checkin': '',
        'stress_share': 'yellow',
        'message_sent': '',
        'profile_update': 'green'
      };
      return `
        <tr>
          <td style="font-size:0.8rem; white-space:nowrap;">${time}</td>
          <td>${log.display_name || log.username || 'Unknown'}</td>
          <td><span class="tag ${actionColors[log.action] || ''}">${log.action}</span></td>
          <td style="font-size:0.85rem; color:var(--text-secondary);">${log.details || ''}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Load activity error:', err);
  }
}

async function loadStressReport() {
  try {
    const data = await API.get('/admin/stress-report');
    if (!data) return;

    document.getElementById('highStressCount').textContent = data.highStress || 0;

    // Render category breakdown as a simple visual
    const container = document.getElementById('stressByCategoryChart');
    if (!data.byCategory || data.byCategory.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No stress data yet</p></div>';
      return;
    }

    const maxCount = Math.max(...data.byCategory.map(c => c.count));
    const catEmojis = {
      'exams': '📚', 'social': '👥', 'family': '👨‍👩‍👧',
      'financial': '💰', 'health': '🏥', 'workload': '⚡', 'other': '🔮'
    };

    container.innerHTML = data.byCategory.map(c => {
      const pct = Math.round((c.count / maxCount) * 100);
      const avgInt = parseFloat(c.avg_intensity).toFixed(1);
      return `
        <div style="margin-bottom:var(--space-md);">
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
            <span>${catEmojis[c.category] || '📌'} ${c.category}</span>
            <span style="color:var(--text-muted);">${c.count} entries · avg ${avgInt}/10</span>
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

async function viewUserDetails(id, name) {
  document.getElementById('modalUserName').textContent = `User: ${name}`;
  document.getElementById('userDetailModal').classList.add('active');
  document.getElementById('userHistoryList').innerHTML = '<p class="empty-state">Loading history...</p>';
  document.getElementById('userCreds').innerHTML = 'Loading credentials info...';
  
  try {
    console.log(`[MindWell Panel] Fetching student ID: ${id}`);
    const data = await API.get(`/admin/user-details/${id}`);
    if (!data) return;

    // History list
    const list = document.getElementById('userHistoryList');
    if (!data.history || data.history.length === 0) {
      list.innerHTML = '<p class="empty-state">No recent wellness records for this student.</p>';
    } else {
      list.innerHTML = data.history.map(h => `
        <div style="padding:var(--space-md); border-bottom:1px solid var(--border-light); font-size:0.85rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <strong>${h.type === 'mood' ? '😊 Mood Check' : '🎯 Stress Share'}</strong>
            <span style="color:var(--text-muted); font-size:0.75rem;">${new Date(h.created_at).toLocaleString()}</span>
          </div>
          <div style="color:var(--text-secondary);">
            ${h.type === 'mood' ? `Comfort Level: <span style="font-weight:600; color:var(--primary);">${h.mood_score}/5</span> · ${h.emoji}` : `Target: <span style="font-weight:600; color:var(--accent-dark);">${h.category}</span> · Intensity: <span style="font-weight:600; color:var(--danger);">${h.intensity}/10</span>`}
          </div>
          ${h.note || h.description ? `<div style="margin-top:8px; padding:var(--space-xs) var(--space-sm); background:var(--bg-alt); border-radius:var(--radius-sm); font-style:italic;">"${h.note || h.description}"</div>` : ''}
        </div>
      `).join('');
    }

    // Identifiers (Credentials)
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
    document.getElementById('userHistoryList').innerHTML = `<p class="error" style="color:var(--danger); padding:var(--space-md); text-align:center;">⚠️ Error: ${err.message}</p>`;
    document.getElementById('userCreds').innerHTML = '<span style="color:var(--danger); font-size:0.8rem;">Could not load credentials info.</span>';
  }
}

function closeUserModal() {
  document.getElementById('userDetailModal').classList.remove('active');
}

async function sendSupportNote(userId) {
  const note = document.getElementById('adminNote').value;
  if (!note) return showToast('Please enter a note!', 'warning');

  try {
    await API.post(`/admin/user/${userId}/support`, { message: note });
    showToast('Support note sent to student dashboard!', 'success');
    document.getElementById('adminNote').value = '';
    closeUserModal();
  } catch (err) {
    showToast('Failed to send support note.', 'error');
  }
}
