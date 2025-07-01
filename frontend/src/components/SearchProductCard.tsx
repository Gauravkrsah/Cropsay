import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Star } from 'lucide-react';
import { Product } from '@/data/productData';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface SearchProductCardProps {
  product: Product;
}

const SearchProductCard: React.FC<SearchProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { items, addItem, updateQuantity } = useCart();

  // Find if this product is in cart
  const cartItem = items.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleProductClick = () => {
    navigate(`/shop/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity === 0) {
      addItem(product);
    } else {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      updateQuantity(product.id, 0);
    }
  };

  // Helper to get discount percentage
  const getDiscountPercentage = () => {
    // Random discount for demo - in real app this would come from product data
    const discounts = [20, 25, 30, 35, 40, 50];
    return discounts[product.id % discounts.length];
  };

  const discount = getDiscountPercentage();
  const originalPrice = Math.round(product.price * (1 + discount / 100));

  return (
    <div 
      onClick={handleProductClick}
      className="bg-[#10141E] rounded-lg border border-[#2A3143] hover:border-[#3A4153] transition-all cursor-pointer overflow-hidden"
    >
      {/* Discount Badge */}
      <div className="relative">
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
            {discount}% OFF
          </span>
        </div>
        
        {/* Product Image Placeholder */}
        <div className="aspect-square bg-[#2A3143] flex items-center justify-center">
          <div className="w-16 h-16 bg-[#1E2735] rounded-lg flex items-center justify-center">
            <span className="text-2xl">
              {product.category === 'Seeds' ? '🌱' : 
               product.category === 'Fertilizers' ? '🧪' :
               product.category === 'Pesticides' ? '🐛' :
               product.category === 'Irrigation' ? '💧' : '🔧'}
            </span>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Delivery Info */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs text-gray-400">⏱</span>
          <span className="text-xs text-gray-400">15 MINS</span>
        </div>

        {/* Product Name */}
        <h3 className="text-white text-sm font-medium mb-1 line-clamp-2">
          {product.name}
        </h3>

        {/* Weight/Size */}
        <p className="text-xs text-gray-400 mb-2">
          {product.category === 'Seeds' ? '250 g' : 
           product.category === 'Fertilizers' ? '1 kg' :
           product.category === 'Pesticides' ? '500 ml' : '1 piece'}
        </p>

        {/* Price and Cart */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">₹{product.price}</span>
            <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
          </div>

          {/* Add to Cart Button */}
          {quantity === 0 ? (
            <button
              onClick={handleAddToCart}
              className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-green-500 rounded-md">
              <button
                onClick={handleRemoveFromCart}
                className="p-1.5 hover:bg-green-600 rounded-l-md transition-colors"
              >
                <Minus size={12} className="text-white" />
              </button>
              <span className="text-white text-sm font-medium min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                onClick={handleAddToCart}
                className="p-1.5 hover:bg-green-600 rounded-r-md transition-colors"
              >
                <Plus size={12} className="text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchProductCard;
