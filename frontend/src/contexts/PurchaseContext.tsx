import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrdersByUser } from '@/services/orderService';

interface PurchasedProduct {
  id: string | number;
  name: string;
  productId: string | number;
  hasRated?: boolean;
}

interface PurchaseContextProps {
  purchasedProducts: PurchasedProduct[];
  isPurchased: (productId: string | number) => boolean;
  hasRated: (productId: string | number) => boolean;
  markAsRated: (productId: string | number) => void;
  refreshPurchases: () => Promise<void>;
  loadingPurchases: boolean;
}

const PurchaseContext = createContext<PurchaseContextProps | undefined>(undefined);

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const { user } = useAuth();

  const isPurchased = (productId: string | number) => {
    return purchasedProducts.some(product => String(product.productId) === String(productId));
  };

  const hasRated = (productId: string | number) => {
    const product = purchasedProducts.find(p => String(p.productId) === String(productId));
    return product?.hasRated || false;
  };

  const markAsRated = (productId: string | number) => {
    setPurchasedProducts(prev => 
      prev.map(product => 
        String(product.productId) === String(productId) 
          ? { ...product, hasRated: true } 
          : product
      )
    );
  };

  const refreshPurchases = async () => {
    if (!user?.id) return;
    setLoadingPurchases(true);
    try {
      const orders = await getOrdersByUser(user.id);
      const products: PurchasedProduct[] = [];
        // Extract all products from orders
      orders.forEach(order => {
        if (order.items) {
          // Handle items with better error handling
          let itemsArray: any[] = [];
          
          try {
            if (Array.isArray(order.items)) {
              itemsArray = order.items;
            } else if (typeof order.items === 'string') {
              itemsArray = JSON.parse(order.items);
            } else if (typeof order.items === 'object') {
              // If it's already a JSONB object from Supabase
              itemsArray = Array.isArray(order.items) ? order.items : [order.items];
            }
          } catch (error) {
            console.error('Failed to parse order items:', error);
            itemsArray = [];
          }
          
          itemsArray.forEach((item: any) => {
            const itemId = item?.id;
            const itemName = item?.name;
            
            if (itemId && !products.some(p => String(p.productId) === String(itemId))) {
              products.push({
                id: `${order.id}-${itemId}`,
                name: itemName || 'Product',
                productId: itemId,
                hasRated: false // By default, assume not rated
              });
            }
          });
        }
      });
      
      setPurchasedProducts(products);
    } catch (error) {
      console.error('Failed to load purchased products:', error);
    } finally {
      setLoadingPurchases(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      refreshPurchases();
    }
  }, [user]);

  return (
    <PurchaseContext.Provider value={{ 
      purchasedProducts, 
      isPurchased, 
      hasRated,
      markAsRated,
      refreshPurchases,
      loadingPurchases
    }}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => {
  const context = useContext(PurchaseContext);
  if (context === undefined) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return context;
};
