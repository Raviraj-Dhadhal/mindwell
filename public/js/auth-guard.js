/* ============================================================
   MindWell — Auth Guard
   Redirect to login if not authenticated (for protected pages)
   ============================================================ */

(function() {
  const protectedPages = ['dashboard.html', 'profile.html', 'community.html'];
  const adminPages = ['admin.html'];
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Check if current page requires authentication
  if (protectedPages.includes(currentPage)) {
    const token = localStorage.getItem('mindwell_token');
    if (!token) {
      window.location.href = '/login.html?redirect=' + encodeURIComponent(currentPage);
    }
  }

  // Check if current page requires admin
  if (adminPages.includes(currentPage)) {
    const token = localStorage.getItem('mindwell_token');
    const userData = localStorage.getItem('mindwell_user');
    
    if (!token || !userData) {
      window.location.href = '/login.html?redirect=' + encodeURIComponent(currentPage);
    } else {
      const user = JSON.parse(userData);
      if (user.role !== 'admin') {
        window.location.href = '/dashboard.html';
      }
    }
  }
})();
