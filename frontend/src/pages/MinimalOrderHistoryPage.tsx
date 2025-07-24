import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdersByUser, cancelOrder as cancelOrderAPI, deleteOrder as deleteOrderAPI, subscribeToOrders } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Package, Calendar, Trash2, X, Eye, AlertCircle, MapPin, Phone, CreditCard, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// This is a minimal version that doesn't rely on PurchaseContext
const MinimalOrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

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

  // Load orders function
  const loadOrders = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getOrdersByUser(user.id);
      setOrders(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // WebSocket subscription for real-time updates
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up WebSocket subscription for orders');
    const unsubscribe = subscribeToOrders((payload) => {
      console.log('Order update received:', payload);

      // Reload orders when any order is updated
      if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        loadOrders();

        // Show toast notification
        if (payload.eventType === 'UPDATE') {
          toast({
            title: "Order Updated",
            description: `Order #${payload.new?.id?.substring(0, 8)}... has been updated`,
          });
        } else if (payload.eventType === 'DELETE') {
          toast({
            title: "Order Deleted",
            description: "An order has been removed",
          });
        }
      }
    });

    return () => {
      console.log('Cleaning up WebSocket subscription');
      unsubscribe();
    };
  }, [user?.id, loadOrders, toast]);

  const navigateToProduct = (productId: string | number) => {
    navigate(`/shop/product/${productId}`);
  };

  // Cancel order
  const cancelOrder = useCallback(async (orderId: string) => {
    if (!user?.id) return;

    try {
      setCancellingOrderId(orderId);

      // Call the real API to cancel order
      await cancelOrderAPI(orderId);

      // Update local state immediately for better UX
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: 'Cancelled' }
            : order
        )
      );

      toast({
        title: "Order Cancelled",
        description: `Order #${orderId.substring(0, 8)}... has been cancelled successfully`,
      });

    } catch (err: any) {
      console.error('Error cancelling order:', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to cancel order. Please try again.',
        variant: "destructive",
      });
    } finally {
      setCancellingOrderId(null);
    }
  }, [user?.id, toast]);

  // Delete order
  const deleteOrder = useCallback(async (orderId: string) => {
    if (!user?.id) return;

    try {
      setCancellingOrderId(orderId);

      // Call the real API to delete order
      await deleteOrderAPI(orderId);

      // Remove order from local state immediately for better UX
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));

      toast({
        title: "Order Deleted",
        description: `Order #${orderId.substring(0, 8)}... has been deleted successfully`,
      });

    } catch (err: any) {
      console.error('Error deleting order:', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to delete order. Please try again.',
        variant: "destructive",
      });
    } finally {
      setCancellingOrderId(null);
    }
  }, [user?.id, toast]);

  // View order details
  const viewOrderDetails = useCallback((orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowOrderDetails(true);
    }
  }, [orders]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'delivered':
        return 'bg-green-900/30 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-900/30 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Package className="h-7 w-7 text-cropsay-green" />
        <h1 className="text-2xl font-bold text-white">Order History</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cropsay-green"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">You don't have any orders yet.</p>
          <Button
            onClick={() => navigate('/shop')}
            className="bg-cropsay-green hover:bg-cropsay-green/80 text-white"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-[#1E2735] rounded-lg p-4 border border-[#2A3143] hover:border-[#3A4153] transition-all duration-200 shadow-md">
              {/* Order Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-white truncate">
                      Order #{order.id.substring(0, 8)}...
                    </h3>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full border font-medium flex-shrink-0",
                      getStatusColor(order.status)
                    )}>
                      {order.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {order.date ? new Date(order.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                  <button
                    onClick={() => viewOrderDetails(order.id)}
                    className="p-1.5 bg-[#2A3143] hover:bg-[#3A4153] text-gray-300 hover:text-white rounded-md transition-all duration-200 flex items-center justify-center"
                    title="View Details"
                  >
                    <Eye size={14} />
                  </button>

                  {order.status === 'Cancelled' ? (
                    <button
                      onClick={() => deleteOrder(order.id)}
                      disabled={cancellingOrderId === order.id}
                      className="p-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[28px]"
                      title="Delete Order"
                    >
                      {cancellingOrderId === order.id ? (
                        <div className="h-3 w-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      disabled={cancellingOrderId === order.id || order.status === 'Delivered'}
                      className={cn(
                        "p-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[28px]",
                        order.status === 'Delivered' && "opacity-50 cursor-not-allowed"
                      )}
                      title={order.status === 'Delivered' ? 'Cannot cancel delivered order' : 'Cancel Order'}
                    >
                      {cancellingOrderId === order.id ? (
                        <div className="h-3 w-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <X size={14} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="flex items-center justify-between mb-3 p-3 bg-[#171C29] rounded-md">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-base font-semibold text-cropsay-green">रू {order.total}</p>
                  </div>
                  <div className="h-8 w-px bg-[#2A3143]"></div>
                  <div>
                    <p className="text-xs text-gray-400">Payment</p>
                    <p className="text-xs text-gray-300">{order.payment_method || 'N/A'}</p>
                  </div>
                  <div className="h-8 w-px bg-[#2A3143]"></div>
                  <div>
                    <p className="text-xs text-gray-400">Items</p>
                    <p className="text-xs text-gray-300">{safelyParseItems(order.items)?.length || 0} item(s)</p>
                  </div>
                </div>
              </div>

              {/* Items Preview */}
              {safelyParseItems(order.items).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2">Items:</p>
                  <div className="space-y-1">
                    {safelyParseItems(order.items).slice(0, 2).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-[#171C29] rounded-md hover:bg-[#1A1F2E] transition-colors">
                        <div
                          className="cursor-pointer hover:text-cropsay-green flex-grow transition-colors min-w-0"
                          onClick={() => item.id && navigateToProduct(item.id)}
                        >
                          <span className="text-xs text-gray-200 truncate block">{item.name}</span>
                          <span className="text-xs text-gray-400">x {item.quantity}</span>
                        </div>
                        <span className="text-xs text-cropsay-green font-medium ml-2 flex-shrink-0">रू {item.price}</span>
                      </div>
                    ))}
                    {safelyParseItems(order.items).length > 2 && (
                      <div className="text-xs text-gray-400 text-center py-1">
                        +{safelyParseItems(order.items).length - 2} more items
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowOrderDetails(false)}>
          <div
            className="bg-[#1E2735] w-full max-w-2xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl border border-[#2A3143]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#171C29] px-6 py-4 border-b border-[#2A3143] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-cropsay-green" />
                <div>
                  <h2 className="text-lg font-semibold text-white">Order Details</h2>
                  <p className="text-sm text-gray-400">#{selectedOrder.id?.substring(0, 8)}...</p>
                </div>
              </div>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="p-2 hover:bg-[#2A3143] rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Order Status & Basic Info */}
              <div className="p-6 border-b border-[#2A3143]">
                <div className="flex items-center justify-between mb-4">
                  <span className={cn(
                    "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border",
                    getStatusColor(selectedOrder.status)
                  )}>
                    {selectedOrder.status || 'Unknown'}
                  </span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cropsay-green">रू {selectedOrder.total}</p>
                    <p className="text-xs text-gray-400">Total Amount</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-400">Order Date</p>
                      <p className="text-gray-200">
                        {selectedOrder.date ? new Date(selectedOrder.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-400">Payment Method</p>
                      <p className="text-gray-200">{selectedOrder.payment_method || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer & Delivery Info */}
              <div className="p-6 border-b border-[#2A3143]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-cropsay-green" />
                  Customer & Delivery Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-sm">Delivery Address</p>
                      <p className="text-gray-200">{selectedOrder.address || 'No address provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-sm">Phone Number</p>
                      <p className="text-gray-200">{selectedOrder.phone || 'No phone provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-cropsay-green" />
                  Order Items ({safelyParseItems(selectedOrder.items).length})
                </h3>
                <div className="space-y-2">
                  {safelyParseItems(selectedOrder.items).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#171C29] rounded-lg hover:bg-[#1A1F2E] transition-colors border border-[#2A3143]">
                      <div
                        className="flex-grow cursor-pointer hover:text-cropsay-green transition-colors min-w-0"
                        onClick={() => item.id && navigateToProduct(item.id)}
                      >
                        <p className="text-sm font-medium text-gray-200 truncate">{item.name}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          <p className="text-xs text-gray-400">Unit Price: रू {item.price}</p>
                        </div>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <p className="text-sm font-semibold text-cropsay-green">रू {(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-gray-400">Total</p>
                      </div>
                    </div>
                  ))}

                  {/* Order Total Summary */}
                  <div className="mt-4 pt-4 border-t border-[#2A3143]">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">Order Total:</span>
                      <span className="text-xl font-bold text-cropsay-green">रू {selectedOrder.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#171C29] px-6 py-4 border-t border-[#2A3143] flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Order ID: {selectedOrder.id}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="px-4 py-2 bg-[#2A3143] hover:bg-[#3A4153] text-gray-300 hover:text-white rounded-lg transition-colors"
                >
                  Close
                </button>

                {selectedOrder.status === 'Cancelled' ? (
                  <button
                    onClick={() => {
                      deleteOrder(selectedOrder.id);
                      setShowOrderDetails(false);
                    }}
                    className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 rounded-lg transition-colors flex items-center gap-2"
                    disabled={cancellingOrderId === selectedOrder.id}
                  >
                    {cancellingOrderId === selectedOrder.id ? (
                      <>
                        <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete Order
                      </>
                    )}
                  </button>
                ) : selectedOrder.status !== 'Delivered' && (
                  <button
                    onClick={() => {
                      cancelOrder(selectedOrder.id);
                      setShowOrderDetails(false);
                    }}
                    className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 rounded-lg transition-colors flex items-center gap-2"
                    disabled={cancellingOrderId === selectedOrder.id}
                  >
                    {cancellingOrderId === selectedOrder.id ? (
                      <>
                        <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <X size={16} />
                        Cancel Order
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinimalOrderHistoryPage;
