import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Star, ShoppingCart, Clock } from 'lucide-react';
import { Product } from '@/data/productData';
import { useCart } from '@/contexts/CartContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const navigate = useNavigate();
  const { items, addItem, updateQuantity } = useCart();
  const isMobile = useIsMobile();

  // Consistently use the numeric form of product.id for all cart operations
  const productIdAsNumber = Number(product.id);

  // Memoize cartItem lookup so it only re-evaluates when the items array actually changes
  const cartItem = useMemo(() => {
    return items.find(item => item.id === productIdAsNumber);
  }, [items, productIdAsNumber]);

  // Handle click on product card
  const handleClick = (e: React.MouseEvent) => {
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
    e.stopPropagation();
    e.preventDefault();
    
    if (cartItem) {
      updateQuantity(productIdAsNumber, cartItem.quantity + 1);
    } else {
      addItem({
        id: productIdAsNumber,
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
    e.stopPropagation();
    e.preventDefault();
    
    if (cartItem) {
      if (cartItem.quantity > 1) {
        updateQuantity(productIdAsNumber, cartItem.quantity - 1);
      } else if (cartItem.quantity === 1) {
        updateQuantity(productIdAsNumber, 0);
      }
    }
  };

  // Demo images for different product categories
  const getDemoImage = (category: string) => {
    const imageMap: { [key: string]: string } = {
      'Seeds': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop&crop=center',
      'Fertilizers': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=300&fit=crop&crop=center',
      'Pesticides': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=300&fit=crop&crop=center',
      'Tools & Equipment': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop&crop=center',
      'Irrigation': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=300&fit=crop&crop=center',
      'default': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop&crop=center'
    };
    return imageMap[category] || imageMap['default'];
  };

  return (
    <div
      className={cn(
        "relative bg-[#1c232d] rounded-lg shadow hover:shadow-lg hover:shadow-cropsay-green/20 p-2 flex flex-col w-full cursor-pointer border border-[#2A3143] transition-all duration-300 overflow-hidden",
        isMobile ? "h-[240px]" : "h-[260px]"
      )}
      onClick={handleClick}
    >
      {/* Product image area - responsive sizing */}
      <div className={cn(
        "relative w-full mb-2 flex-shrink-0 bg-[#232936] rounded-lg overflow-hidden",
        isMobile ? "h-24" : "h-32"
      )}>
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="object-cover h-full w-full"
            loading="lazy"
          />
        ) : (
          <img
            src={getDemoImage(product.category)}
            alt={product.name}
            className="object-cover h-full w-full"
            loading="lazy"
          />
        )}

        {/* Discount badge - responsive */}
        <span className={cn(
          "absolute top-1 left-1 bg-cropsay-green text-white font-bold rounded text-center leading-none",
          isMobile ? "text-[7px] px-1 py-0.5" : "text-[8px] px-1 py-0.5"
        )}>
          25% OFF
        </span>
      </div>

      {/* Product details section */}
      <div className="flex-1 flex flex-col justify-between min-h-0">
        {/* Product name - responsive text */}
        <div className={cn(
          "text-white font-medium text-left mb-1 flex items-start overflow-hidden",
          isMobile ? "text-xs h-6" : "text-sm h-8"
        )}>
          <span className="line-clamp-2 leading-tight">{product.name}</span>
        </div>

        {/* Product size/quantity - responsive */}
        <div className={cn(
          "text-cropsay-grayText text-left mb-1.5 flex items-center flex-shrink-0",
          isMobile ? "text-[10px] h-3" : "text-xs h-3"
        )}>
          {product.subcategory || product.category}
        </div>

        {/* Price and Add to Cart section - responsive layout */}
        <div className="flex justify-between items-center flex-shrink-0">
          {/* Price section - responsive text */}
          <div className="flex flex-col justify-center text-left">
            <div className={cn(
              "text-white font-semibold",
              isMobile ? "text-xs" : "text-sm"
            )}>
              ₹{product.price.toFixed(0)}
            </div>
            <div className={cn(
              "text-cropsay-grayText line-through",
              isMobile ? "text-[10px]" : "text-xs"
            )}>
              ₹{Math.round(product.price * 1.25)}
            </div>
          </div>

          {/* Add to cart or quantity controls - responsive sizing */}
          <div className="flex justify-center flex-shrink-0">
            {cartItem ? (
              <div className={cn(
                "flex items-center bg-cropsay-green rounded-md",
                isMobile ? "w-[70px] h-[24px]" : "w-[80px] h-[28px]"
              )} onClick={(e) => e.stopPropagation()}>
                <button
                  className={cn(
                    "flex items-center justify-center text-white hover:bg-cropsay-green/80 transition-colors focus:outline-none rounded-l-md",
                    isMobile ? "h-[24px] w-5" : "h-[28px] w-6"
                  )}
                  onClick={handleDecreaseQuantity}
                  data-product-id={product.id}
                  aria-label="Decrease quantity"
                >
                  <Minus size={isMobile ? 10 : 12} />
                </button>
                <span className={cn(
                  "flex-1 flex items-center justify-center text-white font-bold",
                  isMobile ? "h-[24px] text-[10px]" : "h-[28px] text-xs"
                )}>
                  {cartItem.quantity}
                </span>
                <button
                  className={cn(
                    "flex items-center justify-center text-white hover:bg-cropsay-green/80 transition-colors focus:outline-none rounded-r-md",
                    isMobile ? "h-[24px] w-5" : "h-[28px] w-6"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleIncreaseQuantity(e);
                  }}
                  aria-label="Increase quantity"
                >
                  <Plus size={isMobile ? 10 : 12} />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleIncreaseQuantity(e);
                }}
                className={cn(
                  "bg-cropsay-green text-white font-bold rounded-md hover:bg-cropsay-green/80 flex items-center justify-center transition-colors",
                  isMobile ? "w-[70px] h-[24px] text-[10px]" : "w-[80px] h-[28px] text-xs"
                )}
                disabled={!product.inStock}
                data-product-id={product.id}
              >
                ADD
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
