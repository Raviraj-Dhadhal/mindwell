/* ============================================================
   MindWell — login.js
   Handles Login & Signup forms
   ============================================================ */

function switchAuthTab(tab) {
  document.getElementById('loginTab').classList.toggle('active', tab === 'login');
  document.getElementById('signupTab').classList.toggle('active', tab === 'signup');
  document.getElementById('loginForm').classList.toggle('active', tab === 'login');
  document.getElementById('signupForm').classList.toggle('active', tab === 'signup');
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  btn.textContent = 'Logging in...';
  btn.disabled = true;

  try {
    const data = await API.post('/auth/login', {
      email: document.getElementById('loginEmail').value,
      password: document.getElementById('loginPassword').value
    });

    API.setAuth(data.token, data.user);
    showToast(data.message, 'success');

    // Determin redirect destination
    const params = new URLSearchParams(window.location.search);
    const redirectParam = params.get('redirect');
    let destination = '/dashboard.html';
    
    if (redirectParam) {
      destination = `/${redirectParam}`;
    } else if (data.user.role === 'admin') {
      destination = '/admin.html';
    }

    setTimeout(() => {
      window.location.href = destination;
    }, 500);
  } catch (err) {
    showToast(err.message || 'Login failed', 'error');
    btn.textContent = 'Log In →';
    btn.disabled = false;
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const btn = document.getElementById('signupBtn');
  btn.textContent = 'Creating account...';
  btn.disabled = true;

  try {
    const data = await API.post('/auth/register', {
      username: document.getElementById('signupUsername').value,
      email: document.getElementById('signupEmail').value,
      password: document.getElementById('signupPassword').value
    });

    API.setAuth(data.token, data.user);
    showToast(data.message, 'success');

    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 500);
  } catch (err) {
    showToast(err.message || 'Signup failed', 'error');
    btn.textContent = 'Create Account →';
    btn.disabled = false;
  }
}

// If already logged in, redirect
if (API.isLoggedIn()) {
  const user = API.getUser();
  window.location.href = (user && user.role === 'admin') ? '/admin.html' : '/dashboard.html';
}
