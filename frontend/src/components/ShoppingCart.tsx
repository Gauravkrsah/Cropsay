import React, { useState } from 'react';
import { X, ShoppingBag, Info, Minus, Plus, Truck, ArrowLeft, Trash2, CreditCard, PhoneCall, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog as UIDialog, DialogContent as UIDialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { saveOrder } from '@/services/orderService';
import { toast } from '@/components/ui/use-toast';
import { initiateKhaltiPayment } from '@/services/khaltiService';

export const ShoppingCartButton = () => {
  const { totalItems, totalPrice, openCart } = useCart();
  
  return (
    <Button 
      onClick={openCart} 
      className="bg-green-500 hover:bg-green-600 text-white font-medium rounded-md px-3 py-2 transition-colors flex items-center gap-2"
    >
      <ShoppingBag size={18} />
      <div className="flex items-center">
        <span>{totalItems} items</span>
        <span className="ml-1">रू {totalPrice}</span>
      </div>
    </Button>
  );
};

export const CartItemQuantity: React.FC<{ id: number; quantity: number; className?: string; }> = ({ id, quantity, className }) => {
  const { updateQuantity } = useCart();
  
  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    e.preventDefault(); // Prevent default action
    if (quantity > 1) {
      updateQuantity(id, quantity - 1);
    } else if (quantity === 1) {
      // Remove from cart when quantity becomes 0
      updateQuantity(id, 0);
    }
  };
  
  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    e.preventDefault(); // Prevent default action
    updateQuantity(id, quantity + 1);
  };
  
  return (
    <div 
      className={cn("flex items-center bg-[#2A3143] rounded-full h-8", className)} 
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <button 
        className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white rounded-l-full transition-colors"
        onClick={handleDecrease}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      <span className="w-6 text-center text-sm">{quantity}</span>
      <button 
        className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white rounded-r-full transition-colors"
        onClick={handleIncrease}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};

// Format numbers to two decimal places
const formatAmount = (amount: number) => amount.toFixed(2);

export const ShoppingCart = () => {
  const { items, totalItems, totalPrice, isCartOpen, closeCart, removeItem, clearCart } = useCart();
  const { user } = useAuth();  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState<string>("Khalti");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>({});
  const [orderComplete, setOrderComplete] = useState(false);
  const [pendingKhalti, setPendingKhalti] = useState(false);
  const [khaltiOrderProcessed, setKhaltiOrderProcessed] = useState(false);
  const { profile } = useAuth();
  
  // Pre-fill form with user profile data when available
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      address: '',
    }
  });

  // Validation rules
  const nameValidation = {
    required: 'Name is required',
    pattern: {
      value: /^[A-Za-z\s]+$/,
      message: 'Name must contain only letters and spaces',
    },
  };
  const phoneValidation = {
    required: 'Phone is required',
    pattern: {
      value: /^\d{10}$/,
      message: 'Phone must be exactly 10 digits',
    },
  };

  // Calculate additional fees
  const deliveryCharge = totalPrice > 0 ? 25 : 0;
  const isFreeDelivery = totalPrice >= 100;
  const handlingCharge = totalPrice > 0 ? 4 : 0;
  const grandTotal = totalPrice + (isFreeDelivery ? 0 : deliveryCharge) + handlingCharge;

  // Khalti config (for frontend, only public key is used for widget, but payment is initiated via backend)
  const khaltiConfig = {
    publicKey: 'c68726c852d943aab3b886bd381d3af7', // Live public key
    productIdentity: 'cropsay-cart',
    productName: 'Cropsay Order',
    productUrl: window.location.origin,
    eventHandler: {
      onSuccess: async (payload: any) => {
        // Save order on success
        await handleOrderSave('Khalti', payload);
      },
      onError: (error: any) => {
        setIsProcessing(false);
        alert('Khalti Payment Failed!');
      },
      onClose: () => {
        setIsProcessing(false);
        setShowCheckout(false); // Ensure modal closes when Khalti closes
      },
    },
    paymentPreference: ["KHALTI","EBANKING","MOBILE_BANKING","CONNECT_IPS","SCT"],
  };

  // eSewa config
  const esewaConfig = {
    amt: formatAmount(grandTotal),
    psc: 0,
    pdc: 0,
    txAmt: 0,
    tAmt: formatAmount(grandTotal),
    pid: `CSY-${Date.now()}`,
    scd: 'EPAYTEST',
    su: window.location.origin + '/?esewa=success',
    fu: window.location.origin + '/?esewa=failure',
  };
  // Save order to DB
  const handleOrderSave = async (payment_method: string, formData: any = null, paymentPayload?: any) => {
    setIsProcessing(true);
    try {
      // Use formData directly if provided, otherwise fall back to checkoutData
      const orderData = formData || checkoutData;
      
      if (!orderData || !orderData.address || !orderData.phone) {
        throw new Error('Missing order data');
      }
      
      await saveOrder({
        user_id: user.id,
        date: new Date().toISOString(),
        total: grandTotal,
        status: payment_method === 'COD' ? 'Pending' : 'Paid',
        items: items,
        address: orderData.address,
        phone: orderData.phone,
        payment_method,
        ...(paymentPayload ? { payment_payload: paymentPayload } : {})
      } as any);
      setShowCheckout(false);
      closeCart();
      reset();
      clearCart();
      setOrderComplete(true);
      // Optionally: show success toast
    } catch (e) {
      console.error('Order save error:', e);
      toast({
        title: 'Order Failed',
        description: 'Order save failed! Please try again.',
        variant: 'destructive',
      });
    }
    setIsProcessing(false);
  };

  // Ref to hold pending order data for Khalti
  const pendingOrderData = React.useRef<any>(null);
  // Process checkout based on payment method
  const onCheckout = (data: any) => {
    setCheckoutData(data);
    if (selectedPayment === 'Khalti') {
      // Prepare order data and store in ref
      const pendingOrder = {
        user_id: user.id,
        date: new Date().toISOString(),
        total: grandTotal,
        status: 'Paid',
        items: items,
        address: data.address,
        phone: data.phone,
        payment_method: 'Khalti',
      };
      pendingOrderData.current = pendingOrder;
      // Save to localStorage for recovery after redirect
      localStorage.setItem('pendingKhaltiOrder', JSON.stringify(pendingOrder));
      setShowCheckout(false);
      closeCart();
      setTimeout(() => {
        initiateKhaltiPayment({
          amount: Math.round(grandTotal * 100),
          purchase_order_id: `order_${Date.now()}`,
          purchase_order_name: 'Cropsay Order',
          customer_info: {
            name: data.name,
            email: user?.email || '',
            phone: data.phone
          },
          onError: (err) => {
            setIsProcessing(false);
            alert('Khalti Payment Failed: ' + (err?.detail || 'Unknown error'));
          },
          onSuccess: () => {
            // Optionally, you can show a message or spinner here
          }
        });
      }, 400);
    } else if (selectedPayment === 'eSewa') {
      // Create and submit a form to eSewa sandbox
      setIsProcessing(true);
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://rc-epay.esewa.com.np/api/epay/main';
      Object.entries(esewaConfig).forEach(([k, v]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = v as string;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
      // Order will be saved on return (handle in a useEffect for ?esewa=success)
    } else if (selectedPayment === 'COD') {
      // For COD, directly pass the form data to handleOrderSave
      handleOrderSave('COD', data);
    }
  };
    // When cart is opened, reset orderComplete
  React.useEffect(() => {
    if (isCartOpen) setOrderComplete(false);
  }, [isCartOpen]);
  
  // Pre-fill form with user profile data when checkout is displayed
  React.useEffect(() => {
    if (showCheckout && profile) {
      // Use profile data to fill the form
      if (profile.full_name) {
        setValue('name', profile.full_name);
      }
      if (profile.phone) {
        setValue('phone', profile.phone);
      }
      if (profile.address) {
        setValue('address', profile.address);
      }
    }
  }, [showCheckout, profile, setValue]);
  // Listen for Khalti payment success from popup or redirect
  const [searchParams] = useSearchParams();  React.useEffect(() => {
    // Skip if we've already processed a Khalti order in this session
    if (khaltiOrderProcessed) return;
    
    function handleKhaltiMessage(event: MessageEvent) {
      if (event.data && event.data.khaltiPayment === 'success' && !khaltiOrderProcessed) {
        // Save the pending order as Paid (from ref or localStorage)
        let order = pendingOrderData.current;
        if (!order) {
          const stored = localStorage.getItem('pendingKhaltiOrder');
          if (stored) order = JSON.parse(stored);
        }
        if (order) {
          setKhaltiOrderProcessed(true); // Mark as processed to prevent duplicate saves
          setIsProcessing(true);
          saveOrder(order)
            .then(() => {
              setOrderComplete(true);
              clearCart();
              reset();
              localStorage.removeItem('pendingKhaltiOrder');
              localStorage.removeItem('khaltiPaymentSuccess');
            })
            .catch(() => {
              setKhaltiOrderProcessed(false); // Reset on failure
              toast({
                title: 'Order Failed',
                description: 'Order save failed! Please try again.',
                variant: 'destructive',
              });
            })
            .finally(() => setIsProcessing(false));
          pendingOrderData.current = null;
        }
      }
    }
    window.addEventListener('message', handleKhaltiMessage);

    // Recovery: Check if we've returned from Khalti through any method
    const khaltiParam = searchParams.get('khalti');
    if (
      (window.location.pathname.startsWith('/payment/success') ||
      localStorage.getItem('khaltiPaymentSuccess') === '1' ||
      khaltiParam === 'success') && 
      !khaltiOrderProcessed // Only proceed if not already processed
    ) {
      // Only try to save if there is a pending order
      const stored = localStorage.getItem('pendingKhaltiOrder');
      if (stored) {
        setKhaltiOrderProcessed(true); // Mark as processed to prevent duplicate saves
        setIsProcessing(true);
        saveOrder(JSON.parse(stored))
          .then(() => {
            setOrderComplete(true);
            clearCart();
            reset();
            localStorage.removeItem('pendingKhaltiOrder');
            localStorage.removeItem('khaltiPaymentSuccess');
          })
          .catch(() => {
            setKhaltiOrderProcessed(false); // Reset on failure
            toast({
              title: 'Order Failed',
              description: 'Order save failed! Please try again.',
              variant: 'destructive',
            });
          })
          .finally(() => setIsProcessing(false));
      } else {
        // No pending order, just clean up the flag
        localStorage.removeItem('khaltiPaymentSuccess');
      }
      // Optionally, redirect to home or orders after a short delay
      setTimeout(() => {
        window.location.href = '/orders';
      }, 1500);
    }

    return () => window.removeEventListener('message', handleKhaltiMessage);
  }, [clearCart, reset, toast, khaltiOrderProcessed]);
  
  return (
    <>
      {/* Cart Popup */}
      {isCartOpen && (
        <Dialog open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
          <DialogContent className="p-0 max-w-3xl bg-[#10141E] text-gray-100 overflow-hidden border border-[#2A3143]">
            <div className="flex justify-between items-center p-4 border-b border-[#2A3143]">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={closeCart}
                  className="rounded-full hover:bg-[#1E2735] h-8 w-8 mr-2 text-gray-300"
                >
                  <ArrowLeft size={16} />
                </Button>
                <h2 className="text-xl font-bold">My Cart ({totalItems})</h2>
              </div>
            </div>
            
            {items.length === 0 ? (
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <ShoppingBag size={48} className="text-gray-500" />
                </div>
                <h3 className="text-lg font-medium">Your cart is empty</h3>
                <p className="text-gray-400 mt-1">Add items to get started</p>
                <Button 
                  className="mt-4 bg-green-500 hover:bg-green-600"
                  onClick={closeCart}
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row max-h-[90vh] overflow-hidden">
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="bg-[#1E2735] p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2A3143] flex items-center justify-center">
                        <Truck size={16} />
                      </div>
                      <div>
                        <p className="font-medium">Delivery options</p>
                        <p className="text-sm text-gray-400">Home delivery • 2-3 days</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fixed height product list with scroll enabled when more than 4 items */}
                  <ScrollArea className="flex-1 p-4 max-h-[400px]" type="always">
                    <div className="space-y-4">
                      {items.map(item => (
                        <div key={item.id} className="flex gap-4 py-2 border-b border-[#2A3143] last:border-0">
                          <div className="w-16 h-16 overflow-hidden rounded-md flex-shrink-0">
                            <Avatar className="w-16 h-16 border border-[#2A3143]">
                              <AvatarImage src={item.image} alt={item.name} />
                              <AvatarFallback className="bg-[#2A3143]">{item.name[0]}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-gray-400">{item.category}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">रू {formatAmount(item.price * item.quantity)}</div>
                                <div className="text-sm text-gray-400">रू {formatAmount(item.price)} each</div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <CartItemQuantity id={item.id} quantity={item.quantity} />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-[#2A3143]/50 rounded-full"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-[#2A3143] bg-[#1E2735] flex flex-col">
                  <div className="p-4">
                    <h3 className="font-bold mb-4">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <div className="text-gray-300">Items total</div>
                        <span>रू {formatAmount(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1 text-gray-300">
                          <span>Delivery charge</span>
                          <button className="text-gray-400">
                            <Info size={12} />
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400 line-through">रू {formatAmount(deliveryCharge)}</span>
                          {isFreeDelivery && <span className="text-green-400 font-medium">FREE</span>}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1 text-gray-300">
                          <span>Handling charge</span>
                          <button className="text-gray-400">
                            <Info size={12} />
                          </button>
                        </div>
                        <span>रू {formatAmount(handlingCharge)}</span>
                      </div>
                      <div className="flex justify-between border-t border-[#2A3143] mt-3 pt-3 font-medium">
                        <span>Grand total</span>
                        <span>रू {formatAmount(grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-[#2A3143]">
                    <div className="space-y-2 text-sm">
                      <h4 className="font-medium mb-2">Payment Methods</h4>
                      {/* Payment Option - Khalti */}
                      <div onClick={() => setSelectedPayment("Khalti")}
                        className={"cursor-pointer bg-[#10141E] rounded-md p-3 flex items-center justify-between border transition-colors " + (selectedPayment === "Khalti" ? "border-green-500" : "border-transparent")}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[#2A3143] rounded-md flex items-center justify-center mr-2">
                            <div className="bg-[#5C2D91] rounded-sm w-4 h-4 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">K</span>
                            </div>
                          </div>
                          <span>Khalti</span>
                        </div>
                        <input type="radio" className="accent-green-500" name="payment" value="Khalti" checked={selectedPayment === "Khalti"} readOnly />
                      </div>

                      {/* Payment Option - eSewa */}
                      <div onClick={() => setSelectedPayment("eSewa")}
                        className={"cursor-pointer bg-[#10141E] rounded-md p-3 flex items-center justify-between border transition-colors " + (selectedPayment === "eSewa" ? "border-green-500" : "border-transparent")}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[#2A3143] rounded-md flex items-center justify-center mr-2">
                            <div className="bg-[#60BB46] rounded-sm w-4 h-4 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">e</span>
                            </div>
                          </div>
                          <span>eSewa</span>
                        </div>
                        <input type="radio" className="accent-green-500" name="payment" value="eSewa" checked={selectedPayment === "eSewa"} readOnly />
                      </div>

                      {/* Payment Option - Fonepay */}
                      <div onClick={() => setSelectedPayment("Fonepay")}
                        className={"cursor-pointer bg-[#10141E] rounded-md p-3 flex items-center justify-between border transition-colors " + (selectedPayment === "Fonepay" ? "border-green-500" : "border-transparent")}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[#2A3143] rounded-md flex items-center justify-center mr-2">
                            <div className="bg-[#FF0000] rounded-sm w-4 h-4 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">F</span>
                            </div>
                          </div>
                          <span>Fonepay</span>
                        </div>
                        <input type="radio" className="accent-green-500" name="payment" value="Fonepay" checked={selectedPayment === "Fonepay"} readOnly />
                      </div>

                      {/* Payment Option - COD */}
                      <div onClick={() => setSelectedPayment("COD")}
                        className={"cursor-pointer bg-[#10141E] rounded-md p-3 flex items-center justify-between border transition-colors " + (selectedPayment === "COD" ? "border-green-500" : "border-transparent")}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[#2A3143] rounded-md flex items-center justify-center mr-2">
                            <CreditCard size={16} />
                          </div>
                          <span>COD</span>
                        </div>
                        <input type="radio" className="accent-green-500" name="payment" value="COD" checked={selectedPayment === "COD"} readOnly />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto p-4 border-t border-[#2A3143]">
                    <Button
                      className="w-full bg-green-500 hover:bg-green-600 text-white h-11"
                      onClick={() => {
                        if (!user) {
                          setShowLoginPrompt(true);
                          return;
                        }
                        setShowCheckout(true);
                      }}
                    >
                      Proceed to Payment • रू {formatAmount(grandTotal)}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Checkout Popup */}
      {showCheckout && (
        <UIDialog open={showCheckout} onOpenChange={setShowCheckout}>
          <UIDialogContent className="max-w-md w-full bg-[#10141E] text-gray-100 border border-[#2A3143]">
            <DialogHeader>
              <DialogTitle>Checkout</DialogTitle>
              <DialogDescription>
                Please fill in your details to complete the order.
              </DialogDescription>
            </DialogHeader>            <form onSubmit={handleSubmit(onCheckout)} className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm">Full Name</label>
                  {profile?.full_name && <span className="text-xs text-green-400">From your profile</span>}
                </div>
                <Input 
                  {...register('name', nameValidation)} 
                  placeholder="Your Name" 
                  className={`bg-[#1E2735] border-[#2A3143] ${profile?.full_name ? 'border-green-600/40' : ''}`} 
                />
                {errors.name && <span className="text-red-400 text-xs">{errors.name?.message?.toString()}</span>}
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm">Phone Number</label>
                  {profile?.phone && <span className="text-xs text-green-400">From your profile</span>}
                </div>
                <Input 
                  {...register('phone', phoneValidation)} 
                  placeholder="98XXXXXXXX" 
                  className={`bg-[#1E2735] border-[#2A3143] ${profile?.phone ? 'border-green-600/40' : ''}`}
                />
                {errors.phone && <span className="text-red-400 text-xs">{errors.phone?.message?.toString()}</span>}
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm">Delivery Address</label>
                  {profile?.address && <span className="text-xs text-green-400">From your profile</span>}
                </div>
                <Input 
                  {...register('address', { required: 'Address is required' })} 
                  placeholder="Delivery Address" 
                  className={`bg-[#1E2735] border-[#2A3143] ${profile?.address ? 'border-green-600/40' : ''}`}
                />
                {errors.address && <span className="text-red-400 text-xs">{errors.address?.message?.toString()}</span>}
              </div>
              {selectedPayment === 'Khalti' && (
                <div className="bg-[#232B3B] p-3 rounded-md text-xs text-purple-300 border border-purple-700">
                  <b>Khalti Test Mode</b><br />
                  No real money will be charged.
                </div>
              )}
              {selectedPayment === 'eSewa' && (
                <div className="bg-[#232B3B] p-3 rounded-md text-xs text-green-300 border border-green-700">
                  <b>eSewa Test Mode</b><br />
                  Test ID: 9806800001<br />Password: Nepal@123<br />Merchant ID: EPAYTEST<br />No real money will be charged.
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCheckout(false)}>
                  Cancel
                </Button>
                {selectedPayment === 'Khalti' ? (
                  <Button
                    type="submit"
                    className="bg-[#5C2D91] hover:bg-[#47216e] text-white"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Pay with Khalti'}
                  </Button>
                ) : (
                  <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
                    {selectedPayment === 'COD' ? 'Place Order (COD)' : `Pay with ${selectedPayment}`}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </UIDialogContent>
        </UIDialog>
      )}

      {/* Order Complete Popup */}
      {orderComplete && (
        <UIDialog open={orderComplete} onOpenChange={setOrderComplete}>
          <UIDialogContent className="max-w-lg w-full bg-[#10141E] text-gray-100 border border-[#2A3143]">
            <DialogHeader>
              <DialogTitle>Order Placed Successfully!</DialogTitle>
              <DialogDescription>
                Your order has been placed and saved to your order history.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={() => { setOrderComplete(false); navigate('/orders'); }}>
                View Order History
              </Button>
            </div>
          </UIDialogContent>
        </UIDialog>
      )}

      <UIDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <UIDialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to proceed to checkout and payment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoginPrompt(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => {
                setShowLoginPrompt(false);
                closeCart();
                navigate('/auth');
              }}
            >
              Login / Sign up
            </Button>
          </DialogFooter>
        </UIDialogContent>
      </UIDialog>
    </>
  );
};
