import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdersByUser } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';

const FixedOrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    
    const loadOrders = async () => {
      setLoading(true);
      try {
        const data = await getOrdersByUser(user.id);
        setOrders(data);
        setError(null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrders();
  }, [user]);

  const navigateToProduct = (productId: string | number) => {
    navigate(`/shop/product/${productId}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-cropsay-green">Order History (Fixed Version)</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-400">No orders found.</div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-[#181F2C] rounded-lg p-5 border border-[#232B3B]">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-semibold text-lg">Order #{order.id}</span>
                  <span className="ml-4 text-sm text-gray-400">{new Date(order.date).toLocaleString()}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'Paid' || order.status === 'Delivered' ? 'bg-green-900 text-green-400' : order.status === 'Pending' ? 'bg-yellow-900 text-yellow-400' : 'bg-red-900 text-red-400'}`}>{order.status}</span>
              </div>
              <div className="text-sm text-gray-300 mb-2">Total: रू {order.total}</div>
              <div className="text-xs text-gray-400 mb-2">Payment: {order.payment_method}</div>
              <div className="text-xs text-gray-400 mb-2">Address: {order.address}</div>
              <div className="text-xs text-gray-400 mb-2">Phone: {order.phone}</div>
              <div className="mt-2">
                <b>Items:</b>
                <ul className="mt-1 space-y-2">
                  {order.items && Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                    <li key={idx} className="flex items-center justify-between p-2 bg-[#1E2735] rounded-md">
                      <div 
                        className="cursor-pointer hover:text-[#11B981] flex-grow"
                        onClick={() => navigateToProduct(item.id)}
                      >
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

      <div className="mt-8 p-4 bg-gray-800 text-white rounded">
        <h2 className="text-xl mb-2">Debug Information</h2>
        <p>User ID: {user?.id || 'Not logged in'}</p>
        <p>Orders loaded: {orders.length}</p>
        <p>Error: {error || 'None'}</p>
      </div>
    </div>
  );
};

export default FixedOrderHistoryPage;
