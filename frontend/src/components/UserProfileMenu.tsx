import React, { useEffect, useState } from 'react';
import { LogOut, User, Settings, HelpCircle, ShoppingBag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog as UIDialog, DialogContent as UIDialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getOrdersByUser, cancelOrder, deleteOrder } from '@/services/orderService';
import { toast } from '@/components/ui/use-toast';

export const UserProfileMenu = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Form states for profile editing
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    address: '',
  });
  
  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (showOrders && user) {
      getOrdersByUser(user.id).then(setOrders);
    }
  }, [showOrders, user]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
      // Refresh orders from backend
      if (user) {
        const updatedOrders = await getOrdersByUser(user.id);
        setOrders(updatedOrders);
      }
      // Optionally show a toast/feedback here
    } catch (err) {
      // Optionally show error feedback
      console.error('Failed to cancel order', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      if (user) {
        const updatedOrders = await getOrdersByUser(user.id);
        setOrders(updatedOrders);
      }
      toast({
        title: 'Order Deleted',
        description: 'Order has been deleted from your history.',
      });
    } catch (err) {
      toast({
        title: 'Delete Failed',
        description: 'Could not delete order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!user) return null;
  
  const userInitials = profile?.full_name 
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() 
    : user.email?.charAt(0).toUpperCase() || 'U';
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-10 w-10 rounded-full p-0 hover:bg-[#1E2735]"
          >
            <Avatar>
              <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || user.email || ''} />
              <AvatarFallback className="bg-green-600 text-white">{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>        <DropdownMenuContent className="w-56 bg-[#10141E] border-[#2A3143] text-gray-100" align="end" forceMount>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile?.full_name || 'User'}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#2A3143]" />
          <DropdownMenuGroup>
            <DropdownMenuItem className="hover:bg-[#1E2735] cursor-pointer" onClick={() => setShowProfile(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-[#1E2735] cursor-pointer" onClick={() => setShowOrders(true)}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span>Orders</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-[#1E2735] cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-[#2A3143]" />
          <DropdownMenuItem 
            onClick={signOut}
            className="text-red-400 hover:text-red-300 hover:bg-[#1E2735] cursor-pointer focus:text-red-300"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>      {/* Profile Popup */}
      <UIDialog open={showProfile} onOpenChange={(open) => {
        if (!open) {
          setEditMode(false);
        }
        setShowProfile(open);
      }}>
        <UIDialogContent className="max-w-md w-full bg-[#10141E] text-gray-100 border border-[#2A3143]">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>{editMode ? 'Edit your profile details' : 'Account details'}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar className="w-20 h-20 border border-[#2A3143]">
              <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
              <AvatarFallback className="bg-green-600 text-white text-2xl">{userInitials}</AvatarFallback>
            </Avatar>
            {editMode ? (              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    className="bg-[#1E2735] border-[#2A3143] text-white"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    className="bg-[#1E2735] border-[#2A3143] text-white min-h-[80px]"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us about yourself"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="bg-[#1E2735] border-[#2A3143] text-white"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    className="bg-[#1E2735] border-[#2A3143] text-white"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="font-bold text-lg">{profile?.full_name || 'User'}</div>
              </div>
            )}
          </div>
          
          {!editMode && (
            <div className="text-sm text-gray-300 space-y-2">
              <div><b>Joined:</b> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</div>
              {profile?.bio && <div><b>Bio:</b> {profile.bio}</div>}
              {profile?.phone && <div><b>Phone:</b> {profile.phone}</div>}
              {profile?.address && <div><b>Address:</b> {profile.address}</div>}
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            {editMode ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditMode(false);
                    // Reset form data to current profile
                    if (profile) {
                      setFormData({
                        full_name: profile.full_name || '',
                        bio: profile.bio || '',
                        phone: profile.phone || '',
                        address: profile.address || '',
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700" 
                  onClick={async () => {
                    const success = await updateProfile(formData);
                    if (success) {
                      setEditMode(false);
                    }
                  }}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setShowProfile(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700" 
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </DialogFooter>
        </UIDialogContent>
      </UIDialog>{/* Orders Popup */}
      <UIDialog open={showOrders} onOpenChange={setShowOrders}>
        <UIDialogContent className="max-w-md w-full bg-[#10141E] text-gray-100 border border-[#2A3143]">
          <DialogHeader>
            <DialogTitle>My Orders</DialogTitle>
            <DialogDescription>Order history and status</DialogDescription>
          </DialogHeader>          <div className="max-h-[60vh] overflow-y-auto pr-2 my-2">
            <div className="divide-y divide-[#232B3B]">
              {orders.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No orders yet.</div>
              ) : orders.map(order => (
                <div key={order.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div onClick={() => setSelectedOrder(order)} className="cursor-pointer hover:text-gray-300">
                    <div className="font-medium">Order #{order.id}</div>
                    <div className="text-xs text-gray-400">{new Date(order.date).toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Items: {order.items.length}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">रू {order.total.toFixed(2)}</div>
                    <div className={`text-xs ${order.status === 'Delivered' || order.status === 'Paid' ? 'text-green-400' : order.status === 'Cancelled' ? 'text-red-400' : 'text-yellow-400'}`}>{order.status}</div>
                    <div className="flex gap-2 mt-1 justify-end">
                      {(order.status === 'Pending' || order.status === 'Paid') && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => {
                          e.stopPropagation();
                          handleCancelOrder(order.id);
                        }}>
                          Cancel
                        </Button>
                      )}
                      {order.status === 'Cancelled' && (
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrder(order.id);
                        }}>
                          Delete
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </UIDialogContent>
      </UIDialog>      {/* Order Details Popup */}
      <UIDialog open={!!selectedOrder} onOpenChange={open => !open && setSelectedOrder(null)}>
        <UIDialogContent className="max-w-md w-full bg-[#10141E] text-gray-100 border border-[#2A3143]">
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
                    <Button size="sm" variant="destructive" onClick={() => {
                      handleDeleteOrder(selectedOrder.id);
                      setSelectedOrder(null);
                    }}>
                      Delete Order
                    </Button>
                  )}
                </div>
                <div><b>Payment:</b> {selectedOrder.payment_method}</div>
                <div><b>Address:</b> {selectedOrder.address}</div>
                <div><b>Phone:</b> {selectedOrder.phone}</div>
                <div><b>Total:</b> रू {selectedOrder.total.toFixed(2)}</div>
                <div><b>Items:</b>
                  <ul className="ml-4 list-disc">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <li key={idx}>{item.name} x {item.quantity} (रू {item.price})</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </UIDialogContent>
      </UIDialog>
    </>
  );
};
