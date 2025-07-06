// Khalti e-Payment (KPG-2) integration for frontend
// Usage: Import and use the initiateKhaltiPayment function in your React component

// Always open Khalti payment in the same tab (redirect)
const openKhaltiRedirect = (url: string) => {
  window.location.href = url;
};

// Get the API base URL based on environment
const getApiBaseUrl = () => {
  // Check if we're in production (deployed)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Production - use the same origin as the frontend
    return window.location.origin + '/api';
  }
  // Development - use localhost backend
  return 'http://localhost:5001/api';
};

export async function initiateKhaltiPayment({
  amount,
  purchase_order_id,
  purchase_order_name,
  customer_info,
  onError,
  onSuccess
}: {
  amount: number;
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info: { name: string; email: string; phone: string };
  onError?: (err: any) => void;
  onSuccess?: () => void;
}) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    console.log('Using API base URL:', apiBaseUrl); // Debug log

    const response = await fetch(`${apiBaseUrl}/khalti/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        return_url: window.location.origin + '/payment/success',
        website_url: window.location.origin,
        amount,
        purchase_order_id,
        purchase_order_name,
        customer_info
      })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error?.detail || errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('Khalti initiate response:', data); // Debug log

    if (data.payment_url) {
      openKhaltiRedirect(data.payment_url);
      if (onSuccess) onSuccess();
    } else {
      const errorMessage = data.error?.detail || data.error || 'Payment initiation failed';
      throw new Error(errorMessage);
    }
  } catch (err: any) {
    console.error('Khalti payment error:', err);
    const errorMessage = err.message || 'Unknown error occurred';

    if (onError) {
      onError({ message: errorMessage, originalError: err });
    } else {
      alert('Khalti Payment Failed: ' + errorMessage);
    }
  }
}
