import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set a flag in localStorage so the main app can detect payment success
    localStorage.setItem('khaltiPaymentSuccess', '1');

    // Clear cart immediately from localStorage to prevent it from being loaded
    // We need to clear both possible cart keys (user and anonymous)
    const cartKeys = ['cart_anonymous'];
    // Try to get user ID from localStorage if available
    const authData = localStorage.getItem('auth');
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        if (auth.user?.id) {
          cartKeys.push(`cart_${auth.user.id}`);
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    // Clear all possible cart keys
    cartKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Redirect to shop page with payment success parameter
    navigate('/shop?payment=success', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#10141E] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Processing payment success...</p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
