/* ============================================================
   MindWell — contact.js
   ============================================================ */

function handleContactSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const subject = document.getElementById('contactSubject').value;
  const message = document.getElementById('contactMessage').value;

  // Simulate send (no backend endpoint for contact form)
  showToast(`Thanks ${name}! We'll get back to you soon.`, 'success');

  // Reset form
  e.target.reset();
}
