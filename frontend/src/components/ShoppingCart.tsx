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
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import KhaltiCheckout from 'khalti-checkout-web';
import axios from 'axios';
import { saveOrder } from '@/services/orderService';
import { toast } from '@/components/ui/use-toast';

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
        <span className="ml-1">रु {totalPrice}</span>
      </div>
    </Button>
  );
};

export const CartItemQuantity: React.FC<{ id: number; quantity: number; className?: string; }> = ({ id, quantity, className }) => {
  const { updateQuantity } = useCart();
  
  return (
    <div className={cn("flex items-center bg-[#2A3143] rounded-full h-8", className)}>
      <button 
        className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white rounded-l-full"
        onClick={() => updateQuantity(id, quantity - 1)}
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      <span className="w-6 text-center text-sm">{quantity}</span>
      <button 
        className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white rounded-r-full"
        onClick={() => updateQuantity(id, quantity + 1)}
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState<string>("Khalti");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>({});
  const [orderComplete, setOrderComplete] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

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

  // Khalti config
  const khaltiConfig = {
    publicKey: 'test_public_key_dc74e6e9cdde4316b1c3e49da4dd3d12',
    productIdentity: 'cropsay-cart',
    productName: 'Cropsay Order',
    productUrl: 'http://localhost:5173',
    eventHandler: {
      onSuccess: async (payload: any) => {
        // Save order on success
        await handleOrderSave('Khalti', payload);
      },
      onError: (error: any) => {
        setIsProcessing(false);
        alert('Khalti Payment Failed!');
      },
      onClose: () => setIsProcessing(false),
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
  const handleOrderSave = async (payment_method: string, paymentPayload?: any) => {
    setIsProcessing(true);
    try {
      await saveOrder({
        user_id: user.id,
        date: new Date().toISOString(),
        total: grandTotal,
        status: payment_method === 'COD' ? 'Pending' : 'Paid',
        items: items,
        address: checkoutData.address,
        phone: checkoutData.phone,
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
      toast({
        title: 'Order Failed',
        description: 'Order save failed! Please try again.',
        variant: 'destructive',
      });
    }
    setIsProcessing(false);
  };

  // Simulate payment (stub)
  const onCheckout = (data: any) => {
    setCheckoutData(data);
    if (selectedPayment === 'Khalti') {
      setIsProcessing(true);
      const checkout = new KhaltiCheckout(khaltiConfig);
      checkout.show({amount: Math.round(grandTotal * 100)}); // Khalti expects paisa
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
      handleOrderSave('COD');
    }
  };
  
  // When cart is opened, reset orderComplete
  React.useEffect(() => {
    if (isCartOpen) setOrderComplete(false);
  }, [isCartOpen]);
  
  return (
    <>
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
                              <div className="font-medium">रु {formatAmount(item.price * item.quantity)}</div>
                              <div className="text-sm text-gray-400">रु {formatAmount(item.price)} each</div>
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
                      <span>रु {formatAmount(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1 text-gray-300">
                        <span>Delivery charge</span>
                        <button className="text-gray-400">
                          <Info size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 line-through">रु {formatAmount(deliveryCharge)}</span>
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
                      <span>रु {formatAmount(handlingCharge)}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#2A3143] mt-3 pt-3 font-medium">
                      <span>Grand total</span>
                      <span>रु {formatAmount(grandTotal)}</span>
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
                    Proceed to Payment • रु {formatAmount(grandTotal)}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Popup */}
      <UIDialog open={showCheckout} onOpenChange={setShowCheckout}>
        <UIDialogContent className="max-w-md w-full bg-[#10141E] text-gray-100 border border-[#2A3143]">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Please fill in your details to complete the order.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCheckout)} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <Input {...register('name', nameValidation)} placeholder="Your Name" className="bg-[#1E2735] border-[#2A3143]" />
              {errors.name && <span className="text-red-400 text-xs">{errors.name?.message?.toString()}</span>}
            </div>
            <div>
              <label className="block text-sm mb-1">Phone Number</label>
              <Input {...register('phone', phoneValidation)} placeholder="98XXXXXXXX" className="bg-[#1E2735] border-[#2A3143]" />
              {errors.phone && <span className="text-red-400 text-xs">{errors.phone?.message?.toString()}</span>}
            </div>
            <div>
              <label className="block text-sm mb-1">Delivery Address</label>
              <Input {...register('address', { required: 'Address is required' })} placeholder="Delivery Address" className="bg-[#1E2735] border-[#2A3143]" />
              {errors.address && <span className="text-red-400 text-xs">{errors.address?.message?.toString()}</span>}
            </div>
            {selectedPayment === 'Khalti' && (
              <div className="bg-[#232B3B] p-3 rounded-md text-xs text-purple-300 border border-purple-700">
                <b>Khalti Test Mode</b><br />
                Test Public Key: <span className="break-all">test_public_key_dc74e6e9cdde4316b1c3e49da4dd3d12</span>
                <br />No real money will be charged.
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
              <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
                {selectedPayment === 'COD' ? 'Place Order (COD)' : `Pay with ${selectedPayment}`}
              </Button>
            </DialogFooter>
          </form>
        </UIDialogContent>
      </UIDialog>

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
