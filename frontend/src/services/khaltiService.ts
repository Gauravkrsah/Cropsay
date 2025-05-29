// Khalti e-Payment (KPG-2) integration for frontend
// Usage: Import and use the initiateKhaltiPayment function in your React component

// Always open Khalti payment in the same tab (redirect)
const openKhaltiRedirect = (url: string) => {
  window.location.href = url;
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
}) {  try {
    const response = await fetch('http://localhost:5001/api/khalti/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        return_url: window.location.origin + '/?khalti=success',
        website_url: window.location.origin,
        amount,
        purchase_order_id,
        purchase_order_name,
        customer_info
      })
    });
    const data = await response.json();
    if (data.payment_url) {
      openKhaltiRedirect(data.payment_url);
      if (onSuccess) onSuccess();
    } else {
      if (onError) onError(data.error);
      else alert('Khalti Payment Failed: ' + (data.error?.detail || 'Unknown error'));
    }
  } catch (err) {
    if (onError) onError(err);
    else alert('Khalti Payment Failed: ' + (err as any).message);
  }
}
