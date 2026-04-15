/* ============================================================
   MindWell — main.js
   Shared across all pages: Navbar, Auth State, Scroll Observer, Toasts
   ============================================================ */

// ── API Helper ──────────────────────────────────────────────
const API = {
  base: '/api',

  getToken() {
    return localStorage.getItem('mindwell_token');
  },

  getUser() {
    const data = localStorage.getItem('mindwell_user');
    return data ? JSON.parse(data) : null;
  },

  setAuth(token, user) {
    localStorage.setItem('mindwell_token', token);
    localStorage.setItem('mindwell_user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('mindwell_token');
    localStorage.removeItem('mindwell_user');
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      ...options
    };

    try {
      const res = await fetch(`${this.base}${endpoint}`, config);
      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        this.clearAuth();
        window.location.href = '/login.html';
        return null;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  },

  get(endpoint) {
    return this.request(endpoint);
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }
};

// ── Toast Notifications ─────────────────────────────────────
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// ── Navbar Injection ────────────────────────────────────────
function initNavbar() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === 'login.html') return;
  const user = API.getUser();

  const navHTML = `
    <nav class="navbar" id="navbar">
      <div class="container">
        <a href="/index.html" class="nav-logo">
          <div class="logo-icon">🧠</div>
          MindWell
        </a>
        
        <div class="nav-links" id="navLinks">
          <a href="/index.html" class="${currentPage === 'index.html' ? 'active' : ''}">Home</a>
          <a href="/about.html" class="${currentPage === 'about.html' ? 'active' : ''}">About</a>
          <a href="/features.html" class="${currentPage === 'features.html' ? 'active' : ''}">Features</a>
          <a href="/how-it-works.html" class="${currentPage === 'how-it-works.html' ? 'active' : ''}">How It Works</a>
          <a href="/resources.html" class="${currentPage === 'resources.html' ? 'active' : ''}">Resources</a>
          <a href="/dashboard.html" class="auth-only ${currentPage === 'dashboard.html' ? 'active' : ''}">Dashboard</a>
          <a href="/community.html" class="auth-only ${currentPage === 'community.html' ? 'active' : ''}">Community</a>
          <a href="/admin.html" class="admin-only ${currentPage === 'admin.html' ? 'active' : ''}">Admin</a>
          
          <div class="nav-auth">
            <a href="/login.html" class="btn btn-primary btn-sm guest-only">Login</a>
            <div class="nav-user auth-only" id="navUser" onclick="toggleUserMenu()">
              <img src="${user ? user.avatar_url : '/assets/default-avatar.svg'}" alt="avatar" id="navAvatar">
              <span id="navUsername">${user ? user.display_name : 'User'}</span>

              <div class="user-dropdown" id="userDropdown">
                <a href="/profile.html">👤 Profile</a>
                <a href="/dashboard.html">📊 Dashboard</a>
                <hr>
                <a href="#" onclick="logout(); return false;">🚪 Logout</a>
              </div>
            </div>
          </div>
        </div>
        
        <div class="nav-toggle" id="navToggle" onclick="toggleMobileMenu()">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  `;

  document.body.insertAdjacentHTML('afterbegin', navHTML);
  updateAuthState();
}

function toggleMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const navbar = document.getElementById('navbar');
  const isOpen = links.classList.toggle('open');
  toggle.classList.toggle('open', isOpen);
  navbar.classList.toggle('nav-open', isOpen);
}

function toggleUserMenu() {
  const dropdown = document.getElementById("userDropdown");
  if (!dropdown) return;

  dropdown.classList.toggle("show");
}

// close when clicking outside
document.addEventListener("click", function (e) {
  const dropdown = document.getElementById("userDropdown");
  const user = document.getElementById("navUser");

  if (!dropdown || !user) return;

  if (!dropdown.contains(e.target) && !user.contains(e.target)) {
    dropdown.classList.remove("show");
  }
});

// ESC key closes
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.getElementById("userDropdown")?.classList.remove("show");
  }
});

// Close mobile menu on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMobileMenu();
    closeUserDropdown();
  }
});

function updateAuthState() {
  if (API.isLoggedIn()) {
    document.body.classList.add('logged-in');
    const user = API.getUser();
    if (user) {
      const avatar = document.getElementById('navAvatar');
      const username = document.getElementById('navUsername');
      if (avatar) avatar.src = user.avatar_url || '/assets/default-avatar.svg';
      if (username) username.textContent = user.display_name || user.username;
    }
    if (API.isAdmin()) {
      document.body.classList.add('is-admin');
    }
  } else {
    document.body.classList.remove('logged-in', 'is-admin');
  }
}

function logout() {
  API.clearAuth();
  showToast('Logged out successfully', 'success');
  setTimeout(() => window.location.href = '/index.html', 500);
}

// ── Footer Injection ────────────────────────────────────────
function initFooter() {
  const footerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <h3>🧠 MindWell</h3>
            <p>Your mind matters. Track it. Heal it. Grow. A student-first mental health platform combining AI insights, peer support, and wellness tools.</p>
          </div>
          <div class="footer-col">
            <h4>Platform</h4>
            <a href="/features.html">Features</a>
            <a href="/how-it-works.html">How It Works</a>
            <a href="/dashboard.html">Dashboard</a>
            <a href="/community.html">Community</a>
          </div>
          <div class="footer-col">
            <h4>Resources</h4>
            <a href="/resources.html">Blog & Guides</a>
            <a href="/about.html">About Us</a>
            <a href="/contact.html">Contact</a>
          </div>
      <div class="footer-col">
        <h4>Support</h4>
        <a href="/faq.html">FAQs</a>
        <a href="/privacy.html">Privacy Policy</a>
        <a href="/terms.html">Terms of Service</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 MindWell. Made with 💜 for students everywhere.</span>
      <div class="footer-social">
        <a href="https://x.com/" target="_blank" rel="noopener noreferrer" title="Twitter/X">𝕏</a>
        <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" title="Instagram">📷</a>
        <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer" title="Discord">💬</a>
      </div>
    </div>
      </div>
    </footer>
  `;

  document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// ── Scroll Observer (for animations) ────────────────────────
function initScrollObserver() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  if (reveals.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

// ── Navbar scroll effect ────────────────────────────────────
function initNavScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// ── Init Everything ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFooter();
  initScrollObserver();
  initNavScroll();
});