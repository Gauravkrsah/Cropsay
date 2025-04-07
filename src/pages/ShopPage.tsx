
import React, { useState } from 'react';
import { Search, Filter, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart, CartItem } from '@/contexts/CartContext';
import { CartItemQuantity, ShoppingCart, ShoppingCartButton } from '@/components/ShoppingCart';

const categories = [
  'All Products',
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Tools & Equipment',
  'Irrigation',
];

const products = [
  {
    id: 1,
    name: 'Premium Wheat Seeds',
    description: 'High-yield wheat variety optimized for South Asian climate',
    price: 2550,
    rating: 4.9,
    category: 'Seeds',
    inStock: true,
  },
  {
    id: 2,
    name: 'NPK Fertilizer',
    description: 'Balanced formula for wheat cultivation - 20kg bag',
    price: 1200,
    rating: 4.7,
    category: 'Fertilizers',
    inStock: true,
  },
  {
    id: 3,
    name: 'Roundup Herbicide',
    description: 'Effective weed control for crop fields - 5L container',
    price: 899,
    rating: 4.5,
    category: 'Pesticides',
    inStock: true,
  },
  {
    id: 4,
    name: 'Hand Tractor',
    description: 'Small-scale farming equipment for field preparation',
    price: 45000,
    rating: 4.8,
    category: 'Tools & Equipment',
    inStock: false,
  },
  {
    id: 5,
    name: 'Drip Irrigation Kit',
    description: 'Water-saving irrigation system for 1 acre',
    price: 8500,
    rating: 4.6,
    category: 'Irrigation',
    inStock: true,
  },
  {
    id: 6,
    name: 'Rice Seeds',
    description: 'Drought-resistant rice variety - 10kg bag',
    price: 1800,
    rating: 4.4,
    category: 'Seeds',
    inStock: true,
  },
];

const ShopPage = () => {
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const { items, addItem, openCart } = useCart();
  
  const filteredProducts = products.filter(product => {
    if (activeCategory !== 'All Products' && product.category !== activeCategory) {
      return false;
    }
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });
  
  const handleAddToCart = (product: any) => {
    addItem(product);
  };
  
  const cartItemForProduct = (productId: number) => {
    return items.find(item => item.id === productId);
  };

  return (
    <div className="h-screen overflow-y-auto">
      <div className="border-b border-cropsay-grayDark p-4">
        <h1 className="text-2xl font-bold mb-4">Shop Agricultural Products</h1>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cropsay-grayText" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cropsay-darkSecondary border border-cropsay-grayDark rounded-lg py-2 pl-10 pr-4 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all"
            />
          </div>
          <button className="action-button">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          {items.length > 0 ? (
            <button 
              onClick={openCart}
              className="relative p-2 bg-cropsay-darkSecondary hover:bg-cropsay-grayDark rounded-lg transition-colors"
              aria-label={`View cart with ${items.length} items`}
            >
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-cropsay-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {items.reduce((total, item) => total + item.quantity, 0)}
              </span>
            </button>
          ) : (
            <button 
              className="relative p-2 bg-cropsay-darkSecondary hover:bg-cropsay-grayDark rounded-lg transition-colors"
              aria-label="Cart is empty"
            >
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-cropsay-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4">
        {/* Categories */}
        <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-none">
          {categories.map(category => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeCategory === category 
                  ? 'bg-cropsay-green text-white' 
                  : 'bg-cropsay-darkSecondary hover:bg-cropsay-grayDark'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => {
            const cartItem = cartItemForProduct(product.id);
            
            return (
              <div key={product.id} className="bg-cropsay-darkSecondary rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-cropsay-grayDark"></div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-sm">{product.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-cropsay-grayText mt-1 mb-3">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-lg">₹{product.price}</span>
                      <span className={`text-xs ml-2 ${product.inStock ? 'text-green-500' : 'text-red-500'}`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    
                    {cartItem ? (
                      <CartItemQuantity 
                        id={product.id} 
                        quantity={cartItem.quantity} 
                      />
                    ) : (
                      <button 
                        className={`primary-button text-sm ${!product.inStock && 'opacity-50 cursor-not-allowed'}`}
                        disabled={!product.inStock}
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Floating cart button for mobile view */}
      {items.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 md:hidden">
          <ShoppingCartButton />
        </div>
      )}
      
      {/* Shopping Cart Dialog */}
      <ShoppingCart />
    </div>
  );
};

export default ShopPage;
