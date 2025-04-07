
import React from 'react';
import { X, ShoppingBag, Info, Minus, Plus, Truck, ArrowLeft, Trash2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
        <span className="ml-1">₹{totalPrice}</span>
      </div>
    </Button>
  );
};

export const CartItemQuantity: React.FC<{
  id: number;
  quantity: number;
  className?: string;
}> = ({ id, quantity, className }) => {
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

export const ShoppingCart = () => {
  const { items, totalItems, totalPrice, isCartOpen, closeCart, removeItem } = useCart();
  
  // Calculate additional fees
  const deliveryCharge = totalPrice > 0 ? 25 : 0;
  const isFreeDelivery = totalPrice >= 100;
  const handlingCharge = totalPrice > 0 ? 4 : 0;
  const grandTotal = totalPrice + (isFreeDelivery ? 0 : deliveryCharge) + handlingCharge;
  
  return (
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
                    <Truck size={16} className="text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Delivery in 13 minutes</h3>
                    <p className="text-sm text-gray-400">Shipment of {items.length} items</p>
                  </div>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex bg-[#1E2735] rounded-lg p-3 relative">
                      <div className="w-16 h-16 bg-[#2A3143] rounded-md flex-shrink-0"></div>
                      <div className="flex-1 ml-3">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{item.name}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-white hover:bg-[#2A3143]"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-400 mb-1">
                          {item.description.split(' - ')[0]}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="text-green-400 font-medium">₹{item.price}</div>
                          <CartItemQuantity 
                            id={item.id} 
                            quantity={item.quantity}
                          />
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
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1 text-gray-300">
                      <span>Delivery charge</span>
                      <button className="text-gray-400">
                        <Info size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 line-through">₹{deliveryCharge}</span>
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
                    <span>₹{handlingCharge}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#2A3143] mt-3 pt-3 font-medium">
                    <span>Grand total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#2A3143]">
                <div className="space-y-2 text-sm">
                  <h4 className="font-medium mb-2">Payment Methods</h4>
                  <div className="bg-[#10141E] rounded-md p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#2A3143] rounded-md flex items-center justify-center mr-2">
                        <CreditCard size={16} />
                      </div>
                      <span>Credit / Debit Card</span>
                    </div>
                    <input type="radio" className="accent-green-500" name="payment" defaultChecked />
                  </div>
                  <div className="bg-[#10141E] rounded-md p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#2A3143] rounded-md flex items-center justify-center mr-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="24" height="24" rx="12" fill="#2A3143" />
                          <path d="M12 5L7 12H11L10 19L17 10H13L14 5H12Z" fill="#FFFFFF" />
                        </svg>
                      </div>
                      <span>UPI</span>
                    </div>
                    <input type="radio" className="accent-green-500" name="payment" />
                  </div>
                </div>
              </div>
              
              <div className="mt-auto p-4 border-t border-[#2A3143]">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white h-11">
                  Proceed to Payment • ₹{grandTotal}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
