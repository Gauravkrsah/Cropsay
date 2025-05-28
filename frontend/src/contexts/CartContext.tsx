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
  
  const addItem = (product: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };
  
  const removeItem = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  const updateQuantity = (id: number, quantity: number) => {
    setItems(prevItems => {
      if (quantity <= 0) {
        return prevItems.filter(item => item.id !== id);
      }
      
      return prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      );
    });
  };
  
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(getCartStorageKey());
  };
  
  const openCart = () => {
    setIsCartOpen(true);
  };
  
  const closeCart = () => {
    setIsCartOpen(false);
  };
  
  return (
    <CartContext.Provider value={{
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
    }}>
      {children}
    </CartContext.Provider>
  );
};
