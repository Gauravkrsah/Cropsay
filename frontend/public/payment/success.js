// This page is loaded as the Khalti return_url after payment
// It notifies the opener window and closes itself
window.opener?.postMessage({ khaltiPayment: 'success' }, '*');
window.close();

// If redirected (no opener), trigger order save in main app via localStorage recovery
if (!window.opener) {
  // Set a flag in localStorage so the main app can detect payment success
  localStorage.setItem('khaltiPaymentSuccess', '1');
  // Redirect to shop page with payment success parameter
  window.location.href = '/shop?payment=success';
}

// Optionally, show a message if not closed
setTimeout(() => {
  document.body.innerHTML = '<div style="color:white;background:#10141E;padding:2em;text-align:center;font-size:1.2em;">Payment complete. You may close this window.</div>';
}, 1000);
