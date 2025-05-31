import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdersByUser } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

// This is a minimal version that doesn't rely on PurchaseContext
const MinimalOrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to safely parse order items
  const safelyParseItems = (items: any): any[] => {
    try {
      if (Array.isArray(items)) {
        return items;
      } else if (typeof items === 'string') {
        return JSON.parse(items);
      } else if (items && typeof items === 'object') {
        return [items];
      }
      return [];
    } catch (e) {
      console.error('Error parsing order items:', e);
      return [];
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getOrdersByUser(user.id);
        setOrders(data || []);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const navigateToProduct = (productId: string | number) => {
    navigate(`/shop/product/${productId}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-green-500">Order History</h1>
      
      {loading ? (
        <div className="text-center py-8">Loading your orders...</div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>You don't have any orders yet.</p>
          <Button 
            onClick={() => navigate('/shop')} 
            className="mt-4"
            variant="outline"
          >
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-[#181F2C] rounded-lg p-5 border border-[#232B3B]">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-semibold text-lg">Order #{order.id.substring(0, 8)}...</span>
                  <span className="ml-4 text-sm text-gray-400">
                    {new Date(order.date).toLocaleString()}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  order.status === 'Paid' || order.status === 'Delivered' 
                    ? 'bg-green-900 text-green-400' 
                    : order.status === 'Pending' 
                    ? 'bg-yellow-900 text-yellow-400' 
                    : 'bg-red-900 text-red-400'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <div className="text-sm text-gray-300 mb-2">Total: रू {order.total}</div>
              <div className="text-xs text-gray-400 mb-2">Payment: {order.payment_method}</div>
              <div className="text-xs text-gray-400 mb-2">Address: {order.address}</div>
              <div className="text-xs text-gray-400 mb-2">Phone: {order.phone}</div>
              
              <div className="mt-4">
                <h3 className="font-medium">Items:</h3>
                <ul className="mt-1 space-y-2">
                  {safelyParseItems(order.items).map((item: any, idx: number) => (
                    <li 
                      key={idx} 
                      className="flex items-center p-2 bg-[#1E2735] rounded-md cursor-pointer hover:bg-[#273549]"
                      onClick={() => item.id && navigateToProduct(item.id)}
                    >
                      <div className="flex-grow">
                        {item.name} x {item.quantity} (रू {item.price})
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MinimalOrderHistoryPage;
