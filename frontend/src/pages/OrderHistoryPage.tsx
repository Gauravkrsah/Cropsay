import React, { useState } from 'react';
import { getOrdersByUser, cancelOrder, deleteOrder } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const OrderHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    type: 'cancel' | 'delete';
    orderId: string | null;
  }>({ show: false, type: 'cancel', orderId: null });

  React.useEffect(() => {
    if (!user?.id) return;
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user?.id) return;
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

  const handleCancelOrder = async (orderId: string) => {
    setConfirmDialog({
      show: true,
      type: 'cancel',
      orderId
    });
  };

  const handleDeleteOrder = async (orderId: string) => {
    setConfirmDialog({
      show: true,
      type: 'delete',
      orderId
    });
  };

  const confirmAction = async () => {
    if (!confirmDialog.orderId) return;
    
    try {
      if (confirmDialog.type === 'cancel') {
        await cancelOrder(confirmDialog.orderId);
        toast({
          title: 'Order Cancelled',
          description: 'Your order has been cancelled successfully.',
        });
      } else {
        await deleteOrder(confirmDialog.orderId);
        toast({
          title: 'Order Deleted',
          description: 'Order has been removed from your history.',
        });
      }
      
      // Refresh orders
      loadOrders();
      
      // Close any open detail view if it matches the cancelled/deleted order
      if (selectedOrder?.id === confirmDialog.orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      toast({
        title: 'Action Failed',
        description: `Could not ${confirmDialog.type} order. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setConfirmDialog({ show: false, type: 'cancel', orderId: null });
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-cropsay-green">Order History</h1>
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
                <div className="cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <span className="font-semibold text-lg">Order #{order.id}</span>
                  <span className="ml-4 text-sm text-gray-400">{new Date(order.date).toLocaleString()}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'Paid' || order.status === 'Delivered' ? 'bg-green-900 text-green-400' : order.status === 'Pending' ? 'bg-yellow-900 text-yellow-400' : 'bg-red-900 text-red-400'}`}>{order.status}</span>
              </div>
              <div className="text-sm text-gray-300 mb-2">Total: रु {order.total}</div>
              <div className="text-xs text-gray-400 mb-2">Payment: {order.payment_method}</div>
              <div className="text-xs text-gray-400 mb-2">Address: {order.address}</div>
              <div className="text-xs text-gray-400 mb-2">Phone: {order.phone}</div>
              <div className="mt-2">
                <b>Items:</b>
                <ul className="list-disc ml-6 mt-1">
                  {order.items && order.items.map((item: any, idx: number) => (
                    <li key={idx}>{item.name} x {item.quantity} (रु {item.price})</li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                {(order.status === 'Pending' || order.status === 'Paid') && (
                  <Button size="sm" variant="outline" onClick={(e) => {
                    e.stopPropagation();
                    handleCancelOrder(order.id);
                  }}>
                    Cancel Order
                  </Button>
                )}
                {order.status === 'Cancelled' && (
                  <Button size="sm" variant="destructive" onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteOrder(order.id);
                  }}>
                    Delete Order
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOrder(order);
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-md w-full bg-[#10141E] text-gray-100 border border-[#2A3143]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order #{selectedOrder?.id}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="max-h-[60vh] overflow-y-auto my-2 pr-2">
              <div className="space-y-2">
                <div><b>Date:</b> {new Date(selectedOrder.date).toLocaleString()}</div>
                <div className="flex justify-between items-center">
                  <div><b>Status:</b> <span className={`${selectedOrder.status === 'Delivered' || selectedOrder.status === 'Paid' ? 'text-green-400' : selectedOrder.status === 'Cancelled' ? 'text-red-400' : 'text-yellow-400'}`}>{selectedOrder.status}</span></div>
                  {(selectedOrder.status === 'Pending' || selectedOrder.status === 'Paid') && (
                    <Button size="sm" variant="outline" onClick={() => handleCancelOrder(selectedOrder.id)}>
                      Cancel Order
                    </Button>
                  )}
                  {selectedOrder.status === 'Cancelled' && (
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteOrder(selectedOrder.id)}>
                      Delete Order
                    </Button>
                  )}
                </div>
                <div><b>Payment:</b> {selectedOrder.payment_method}</div>
                <div><b>Address:</b> {selectedOrder.address}</div>
                <div><b>Phone:</b> {selectedOrder.phone}</div>
                <div><b>Total:</b> रु {selectedOrder.total.toFixed(2)}</div>
                <div><b>Items:</b>
                  <ul className="ml-4 list-disc">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <li key={idx}>{item.name} x {item.quantity} (रु {item.price})</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.show} onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, show: false })}>
        <AlertDialogContent className="bg-[#10141E] text-gray-100 border border-[#2A3143]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'cancel' 
                ? 'Cancel Order' 
                : 'Delete Order'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'cancel' 
                ? 'Are you sure you want to cancel this order? This action cannot be undone.' 
                : 'Are you sure you want to delete this order? It will be permanently removed from your order history.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#232B3B] text-gray-100 hover:bg-[#2A3143] hover:text-gray-100">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction} 
              className={confirmDialog.type === 'delete' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              {confirmDialog.type === 'cancel' ? 'Cancel Order' : 'Delete Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderHistoryPage;
