/* ============================================================
   MindWell — profile.js
   Load and update user profile
   ============================================================ */

document.addEventListener('DOMContentLoaded', loadProfile);

async function loadProfile() {
  try {
    const data = await API.get('/profile');
    if (!data) return;

    const u = data.user;
    const p = data.progress || {};
    const m = data.moodStats || {};

    // Header
    document.getElementById('profileName').textContent = u.display_name || u.username;
    document.getElementById('profileDisplayName').textContent = u.display_name || u.username;
    document.getElementById('profileEmail').textContent = u.email;
    document.getElementById('profileAvatar').src = u.avatar_url || '/assets/default-avatar.svg';
    document.getElementById('profileJoined').textContent = new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

    // Stats
    document.getElementById('pLevel').textContent = p.level || 1;
    document.getElementById('pXp').textContent = p.xp || 0;
    document.getElementById('pStreak').textContent = `${p.streak_days || 0} days`;
    document.getElementById('pCheckins').textContent = m.total_entries || 0;
    document.getElementById('pAvgMood').textContent = m.avg_mood ? `${parseFloat(m.avg_mood).toFixed(1)}/5` : '-';

    // Form
    document.getElementById('editDisplayName').value = u.display_name || '';
    document.getElementById('editBio').value = u.bio || '';
    document.getElementById('editTheme').value = u.theme_pref || 'light';

    // Account info
    document.getElementById('pUsername').textContent = u.username;
    document.getElementById('pEmailInfo').textContent = u.email;
    document.getElementById('pRole').textContent = u.role === 'admin' ? '🛡️ Admin' : '👤 User';

  } catch (err) {
    console.error('Load profile error:', err);
    showToast('Failed to load profile', 'error');
  }
}

async function updateProfile(e) {
  e.preventDefault();

  try {
    const data = await API.put('/profile', {
      display_name: document.getElementById('editDisplayName').value,
      bio: document.getElementById('editBio').value,
      theme_pref: document.getElementById('editTheme').value
    });

    showToast(data.message, 'success');

    // Update stored user
    if (data.user) {
      const token = API.getToken();
      API.setAuth(token, data.user);
    }

    await loadProfile();
  } catch (err) {
    showToast(err.message || 'Update failed', 'error');
  }
}
