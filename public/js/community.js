/* ============================================================
   MindWell — community.js
   Shadow Chat — anonymous messaging with room support
   ============================================================ */

let currentRoom = 'general';
let refreshInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  loadMessages();
  // Auto-refresh messages every 5 seconds
  refreshInterval = setInterval(loadMessages, 5000);
});

function switchRoom(room, btn) {
  currentRoom = room;
  document.querySelectorAll('.room-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const roomTitles = {
    'general': '💬 General',
    'venting': '🌪️ Venting',
    'study': '📚 Study Support',
    'motivation': '🌟 Motivation',
    'wellness': '🧘 Wellness'
  };
  document.getElementById('roomTitle').textContent = roomTitles[room] || room;
  loadMessages();
}

async function loadMessages() {
  try {
    const data = await API.get(`/community/messages?room=${currentRoom}`);
    if (!data) return;

    const container = document.getElementById('chatMessages');
    
    if (!data.messages || data.messages.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💬</div>
          <h3>Start the conversation</h3>
          <p>No messages yet in this room. Be the first to share!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = data.messages.map(msg => {
      const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const bgColors = ['rgba(74,144,226,0.1)', 'rgba(167,139,250,0.1)', 'rgba(52,211,153,0.1)', 'rgba(250,204,21,0.1)'];
      const bgColor = bgColors[msg.id % bgColors.length];

      return `
        <div class="chat-message">
          <div class="msg-avatar" style="background:${bgColor}">
            ${msg.anonymous_name ? '👻' : '🧑'}
          </div>
          <div class="msg-bubble">
            <div class="msg-name">${msg.sender_name}</div>
            <div class="msg-text">${escapeHtml(msg.content)}</div>
            <div class="msg-time">${time}</div>
          </div>
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;
  } catch (err) {
    console.error('Load messages error:', err);
  }
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const content = input.value.trim();
  if (!content) return;

  try {
    const data = await API.post('/community/messages', {
      content,
      room: currentRoom,
      anonymous: document.getElementById('shadowMode').checked
    });

    input.value = '';
    showToast(data.message, 'success');
    await loadMessages();
  } catch (err) {
    showToast(err.message || 'Failed to send message', 'error');
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
