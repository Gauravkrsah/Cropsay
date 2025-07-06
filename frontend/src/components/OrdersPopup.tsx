import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, DollarSign, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { getOrdersByUser } from '@/services/orderService';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
}

interface OrdersPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    case 'shipped':
      return <Truck className="h-4 w-4 text-blue-400" />;
    case 'processing':
      return <Clock className="h-4 w-4 text-yellow-400" />;
    case 'pending':
      return <AlertCircle className="h-4 w-4 text-orange-400" />;
    default:
      return <Package className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'shipped':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'processing':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'pending':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export const OrdersPopup: React.FC<OrdersPopupProps> = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user?.id) {
      loadOrders();
    }
  }, [isOpen, user?.id]);

  const loadOrders = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const ordersData = await getOrdersByUser(user.id);
      setOrders(ordersData || []);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[90%] mx-auto bg-[#10141E] text-gray-100 border border-[#2A3143] max-h-[75vh] p-5">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-blue-400" />
            My Orders
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            View your order history and track deliveries
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={loadOrders} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No orders found</p>
              <Button onClick={onClose} variant="outline" size="sm">
                Start Shopping
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[350px] pr-2">
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#1E2735] rounded-lg p-3 border border-[#2A3143] hover:border-[#3A4153] transition-colors shadow-sm"
                  >
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-white">
                            #{order.id.substring(0, 8)}...
                          </span>
                          <Badge className={cn("text-[10px] px-2 py-0.5", getStatusColor(order.status))}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(order.date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-400 text-sm">
                          {formatPrice(order.total)}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-1.5 pt-2 border-t border-[#2A3143]/50">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-[#2A3143] rounded flex items-center justify-center flex-shrink-0">
                            <Package className="h-3 w-3 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-200 truncate text-xs font-medium">{item.name}</div>
                            <div className="text-[10px] text-gray-400">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-[10px] text-gray-400 pl-8">
                          +{order.items.length - 2} more items
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex gap-2 pt-3 mt-3 border-t border-[#2A3143]">
          <Button onClick={onClose} variant="outline" className="flex-1 h-9 text-sm">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
