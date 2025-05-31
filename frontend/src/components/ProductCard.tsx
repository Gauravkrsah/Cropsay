import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Star, ShoppingCart } from 'lucide-react';
import { Product } from '@/data/productData';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const navigate = useNavigate();
  const { items, addItem, updateQuantity } = useCart();

  // Consistently use the numeric form of product.id for all cart operations
  const productIdAsNumber = Number(product.id);

  // Memoize cartItem lookup so it only re-evaluates when the items array actually changes
  // This helps prevent unnecessary re-renders of unrelated product cards
  const cartItem = useMemo(() => {
    // Debugging the cart items we're searching through
    console.log(`ProductCard ${product.name} (${productIdAsNumber}): Looking for matching cart item in ${items.length} items`);
    
    // Look for this specific product ID in the cart
    return items.find(item => item.id === productIdAsNumber);
  }, [items, productIdAsNumber]);

  // Log current cart status for this product instance
  console.log(`ProductCard for '${product.name}' (ID: ${productIdAsNumber}): ${cartItem ? `IN CART, Qty: ${cartItem.quantity}` : 'NOT IN CART'}`);
    // Handle click on product card
  const handleClick = (e: React.MouseEvent) => {
    // Only navigate if the click was directly on the card (not on buttons)
    if (!e.defaultPrevented) {
      if (onClick) {
        onClick(product);
      } else {
        navigate(`/shop/product/${product.id}`);
      }
    }
  };

  // Handle increasing quantity
  const handleIncreaseQuantity = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    e.preventDefault(); // Prevent default action
    
    // Log for debugging
    console.log(`Adding/Increasing product to cart: Name='${product.name}', ID=${productIdAsNumber}`);
    
    if (cartItem) {
      // Update quantity of existing cart item using the consistent numeric ID
      updateQuantity(productIdAsNumber, cartItem.quantity + 1);
    } else {
      // Add new product to cart with the consistent numeric ID
      addItem({
        id: productIdAsNumber, // Use consistent numeric ID
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category,
        image: product.images && product.images.length > 0 ? product.images[0] : undefined
      });
    }
  };

  // Handle decreasing quantity
  const handleDecreaseQuantity = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    e.preventDefault(); // Prevent default action
    
    if (cartItem) {
      console.log(`Decreasing quantity for product '${product.name}' (ID: ${productIdAsNumber}), Current Quantity: ${cartItem.quantity}`);
      if (cartItem.quantity > 1) {
        updateQuantity(productIdAsNumber, cartItem.quantity - 1); // Use consistent numeric ID
      } else if (cartItem.quantity === 1) {
        // Remove from cart when quantity becomes 0
        updateQuantity(productIdAsNumber, 0); // Use consistent numeric ID
      }
    }
  };

  return (  <div 
      className="group bg-[#1c232d] rounded-lg overflow-hidden shadow-md hover:shadow-xl border border-[#2A3143] transition-transform duration-300 ease-out hover:-translate-y-1 cursor-pointer w-full h-full flex flex-col relative"
      onClick={handleClick}
    >      {/* Rating badge */}
      <div className="absolute top-2.5 right-2.5 flex items-center z-10 bg-[#11B981] rounded-full px-2 py-0.5 shadow-md">
        <Star size={14} className="text-white fill-white" />
        <span className="text-white text-xs ml-1 font-medium">
          {product.rating ? product.rating.toFixed(1) : "0.0"}
        </span>
      </div>

      {/* Product image area with gradient overlay */}
      <div className="h-48 relative bg-[#232936] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1c232d]/40"></div>
        
        {product.images && product.images.length > 0 ? (          <img 
            src={product.images[0]} 
            alt={product.name}
            className="max-h-40 max-w-[85%] object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#474f5e] text-sm">No image</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        {/* Product category badge */}
        <div className="mb-2">
          <span className="text-[#a6b0c3] text-xs bg-[#232936] px-2 py-0.5 rounded-md font-medium">
            {product.subcategory || product.category || 'Vegetable Seeds'}
          </span>
        </div>
        
        {/* Product name */}
        <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">
          {product.name}
        </h3>
        
        {/* Product description */}
        <p className="text-[#a6b0c3] text-xs mb-3.5 line-clamp-2 flex-grow">
          {product.description || `The ${product.name} Pack`}
        </p>

        <div className="mt-auto pt-3 border-t border-[#2A3143]/50">
          <div className="flex justify-between items-center">
            {/* Price with In Stock tag */}
            <div className="flex flex-col">
              <div className="text-white font-semibold text-base">रू {product.price.toFixed(0)}</div>
              {product.inStock ? (
                <span className="text-xs text-[#11B981] flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#11B981] mr-1.5"></span>
                  In Stock
                </span>
              ) : (
                <span className="text-xs text-red-400 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5"></span>
                  Out of Stock
                </span>
              )}
            </div>            {/* Add to cart or quantity controls */}
            {cartItem ? (
              <div className="flex items-center" onClick={(e) => e.stopPropagation()}>                <button 
                  className="h-8 w-8 flex items-center justify-center text-white bg-[#232936] hover:bg-[#323c4e] active:bg-[#1a2030] rounded-l-md transition-colors focus:outline-none disabled:opacity-50"
                  onClick={handleDecreaseQuantity}
                  data-product-id={product.id}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="h-8 min-w-[32px] px-1 flex items-center justify-center text-sm text-white bg-[#2A3143] font-medium">
                  {cartItem.quantity}
                </span>
                <button 
                  className="h-8 w-8 flex items-center justify-center text-white bg-[#232936] hover:bg-[#323c4e] active:bg-[#1a2030] rounded-r-md transition-colors focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleIncreaseQuantity(e);
                  }}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleIncreaseQuantity(e);
                }}
                className="px-3 py-2 bg-[#11B981] hover:bg-[#0ea06e] text-white text-xs font-medium rounded-md transition-all duration-200 hover:shadow-md hover:shadow-[#11B981]/20 flex items-center justify-center focus:outline-none disabled:opacity-50 disabled:bg-[#11B981]/50 disabled:cursor-not-allowed"
                disabled={!product.inStock}
                data-product-id={product.id}
              >
                <ShoppingCart size={14} className="mr-1.5" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
