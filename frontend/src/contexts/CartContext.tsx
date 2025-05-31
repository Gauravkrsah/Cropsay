import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export type CartItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image?: string;
  category: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();
  
  // Generate a storage key based on user ID or use a temporary key for anonymous users
  const getCartStorageKey = useCallback(() => {
    return user ? `cart_${user.id}` : 'cart_anonymous';
  }, [user]);
  
  // Calculate derived values
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Load cart from localStorage when component mounts or user changes
  useEffect(() => {
    const savedCart = localStorage.getItem(getCartStorageKey());
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse saved cart', error);
        setItems([]);
      }
    } else {
      // Clear the cart if no saved cart exists for this user
      setItems([]);
    }
  }, [user, getCartStorageKey]);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(getCartStorageKey(), JSON.stringify(items));
  }, [items, getCartStorageKey]);  

  // Optimized function to add an item to the cart
  const addItem = useCallback((product: Omit<CartItem, 'quantity'>) => {
    // Ensure ID is a number
    const productId = Number(product.id);
    console.log(`CartContext: Adding item with ID=${productId}, Name=${product.name}`);
    
    setItems(prevItems => {
      // First check if the item exists in the cart
      const existingItemIndex = prevItems.findIndex(item => item.id === productId);
      
      // If we don't need to update the cart, return the same reference to avoid re-renders
      if (existingItemIndex === -1) {
        // Item doesn't exist - add it as new
        return [...prevItems, { 
          ...product,
          id: productId, // Ensure ID is stored as a number
          quantity: 1 
        }];
      } else {
        // Item exists - increment its quantity
        return prevItems.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
    });
  }, []);

  // Optimized function to remove an item from the cart
  const removeItem = useCallback((id: number) => {
    const productId = Number(id);
    console.log(`CartContext: Removing item with ID=${productId}`);
    
    setItems(prevItems => {
      // Check if the item exists at all before creating a new array
      if (!prevItems.some(item => item.id === productId)) {
        return prevItems; // Return same reference if no change needed
      }
      return prevItems.filter(item => item.id !== productId);
    });
  }, []);

  // Optimized function to update an item's quantity
  const updateQuantity = useCallback((id: number, quantity: number) => {
    const productId = Number(id);
    console.log(`CartContext: Updating quantity for product ID=${productId} to ${quantity}`);
    
    setItems(prevItems => {
      // Find the item we're updating
      const itemIndex = prevItems.findIndex(item => item.id === productId);
      
      // If item doesn't exist or quantity is the same, return same reference
      if (itemIndex === -1) {
        console.log(`CartContext: Item ID=${productId} not found in cart, no change made`);
        return prevItems;
      }
      
      const item = prevItems[itemIndex];
      if (item.quantity === quantity) {
        console.log(`CartContext: Item ID=${productId} quantity unchanged (${quantity})`);
        return prevItems;
      }
      
      // Handle removal if quantity is 0
      if (quantity <= 0) {
        console.log(`CartContext: Removing item ID=${productId} (quantity <= 0)`);
        return prevItems.filter(item => item.id !== productId);
      }
      
      // Update the quantity
      console.log(`CartContext: Updating item ID=${productId} quantity from ${item.quantity} to ${quantity}`);
      return prevItems.map((item, index) => 
        index === itemIndex ? { ...item, quantity } : item
      );
    });
  }, []);
  
  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(getCartStorageKey());
  }, [getCartStorageKey]);
  
  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);
  
  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);
  
  // Create a stable context value using memoized functions
  const contextValue = React.useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    openCart,
    closeCart,
  }), [
    items, 
    addItem, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    totalItems, 
    totalPrice, 
    isCartOpen, 
    openCart, 
    closeCart
  ]);
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
