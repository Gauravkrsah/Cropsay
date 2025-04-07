
import React from 'react';
import { X, ShoppingBag, Info, Minus, Plus, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

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
    <div className={cn("quantity-control", className)}>
      <button 
        className="quantity-button"
        onClick={() => updateQuantity(id, quantity - 1)}
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>
      <span className="quantity-display">{quantity}</span>
      <button 
        className="quantity-button"
        onClick={() => updateQuantity(id, quantity + 1)}
        aria-label="Increase quantity"
      >
        <Plus size={16} />
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
      <DialogContent className="p-0 max-w-2xl bg-[#10141E] text-gray-100 overflow-hidden border border-[#2A3143]">
        <div className="flex justify-between items-center p-4 border-b border-[#2A3143]">
          <h2 className="text-xl font-bold">My Cart</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={closeCart}
            className="rounded-full hover:bg-[#1E2735] h-8 w-8 text-gray-300"
          >
            <X size={18} />
          </Button>
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
          <>
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
            
            <ScrollArea className="max-h-[30vh] p-4">
              {items.map((item) => (
                <div key={item.id} className="cart-item relative pr-7">
                  <div className="w-14 h-14 bg-[#1E2735] rounded-md flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.name}</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">
                      {item.description.split(' - ')[0]}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-green-400 font-medium">₹{item.price}</div>
                      <CartItemQuantity 
                        id={item.id} 
                        quantity={item.quantity} 
                        className="h-8"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute right-0 top-1 text-gray-400 hover:text-gray-200 p-1"
                    aria-label="Remove item"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </ScrollArea>
            
            <div className="p-4 bg-[#1E2735]">
              <h3 className="font-bold mb-2">Bill details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <span>Items total</span>
                  </div>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <span>Delivery charge</span>
                    <button className="text-gray-400">
                      <Info size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 line-through">₹{deliveryCharge}</span>
                    {isFreeDelivery && <span className="text-green-400 font-medium">FREE</span>}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <span>Handling charge</span>
                    <button className="text-gray-400">
                      <Info size={14} />
                    </button>
                  </div>
                  <span>₹{handlingCharge}</span>
                </div>
                <div className="cart-total border-t border-[#2A3143] mt-2 pt-2">
                  <span>Grand total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-[#1E2735] border-t border-[#2A3143]">
              <h3 className="font-bold mb-2">Cancellation Policy</h3>
              <p className="text-sm text-gray-400">
                Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
              </p>
            </div>
            
            <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-[#2A3143] bg-[#10141E]">
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                <span className="flex-1 flex items-center justify-between px-4">
                  <span className="font-semibold">₹{grandTotal}</span>
                  <span className="flex items-center gap-1">
                    Login to Proceed
                    <span className="ml-1">→</span>
                  </span>
                </span>
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
