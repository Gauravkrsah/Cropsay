import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ShoppingCartIcon, X, ShoppingBag, Home, ChevronRight, ChevronLeft, Leaf, Zap, Wrench, Package, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart } from '@/components/ShoppingCart';
import { getCategories, getSubcategories, Product, ProductFilters, filterProducts, priceRanges, availableTags, plantTypes } from '@/data/productData';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  fetchProducts,
  searchProducts,
  getProductsByCategory
} from '@/services/productService';
import { getOrdersByUser } from '@/services/orderService';
import ProductCard from '@/components/ProductCard';
import { useIsMobile, useIsSmallMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const ShopPage = () => {
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'newest'>('popular');
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Scroll state for categories and subcategories
  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false);
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(false);
  const [canScrollSubcategoriesLeft, setCanScrollSubcategoriesLeft] = useState(false);
  const [canScrollSubcategoriesRight, setCanScrollSubcategoriesRight] = useState(false);

  // Refs for scroll containers
  const categoriesScrollRef = React.useRef<HTMLDivElement>(null);
  const subcategoriesScrollRef = React.useRef<HTMLDivElement>(null);

  // New comprehensive filter state
  const [filters, setFilters] = useState<ProductFilters>({
    category: undefined,
    subcategory: undefined,
    priceRange: undefined,
    availability: 'all',
    isOrganic: undefined,
    plantType: undefined,
    tags: [],
    rating: undefined
  });
  const [activeSubcategory, setActiveSubcategory] = useState<string>('');
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [organicFilter, setOrganicFilter] = useState<'all' | 'organic' | 'non-organic'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');

  const { items, openCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();

  const categories = getCategories();
  
  // Search suggestions for animated placeholder
  const searchSuggestions = [
    "Search for seeds, fertilizers & more...",
    "Search: organic tomato seeds",
    "Search: NPK fertilizer", 
    "Search: garden tools",
    "Search: pesticides",
    "Search: irrigation equipment",
    "Search: greenhouse supplies",
    "Search: soil amendments"
  ];

  // Animated placeholder effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prev) => (prev + 1) % searchSuggestions.length);
    }, 3000); // Change every 3 seconds for better readability

    return () => clearInterval(interval);
  }, [searchSuggestions.length]);

  // Load products
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let fetchedProducts: Product[] = [];
      
      if (searchQuery.trim()) {
        fetchedProducts = await searchProducts(searchQuery);
        console.log(`Fetched ${fetchedProducts.length} products matching search: "${searchQuery}"`);
      } else if (activeCategory === 'All Products') {
        fetchedProducts = await fetchProducts();
        console.log(`Fetched all ${fetchedProducts.length} products`);
      } else {
        // Fetch all products for the selected category to ensure we have complete data
        fetchedProducts = await getProductsByCategory(activeCategory);
        console.log(`Fetched ${fetchedProducts.length} products for category: "${activeCategory}"`);
      }
      
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeCategory]);
  
  // Load orders
  const loadOrders = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      const data = await getOrdersByUser(user.id);
      setOrders(data);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setOrdersError(err.message || 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, [user?.id]);
  
  // Cancel order
  const cancelOrder = useCallback(async (orderId: string) => {
    if (!user?.id) return;
    
    try {
      setCancellingOrderId(orderId);
      // Call API to cancel order
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update orders list with cancelled status
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'Cancelled' } 
            : order
        )
      );
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      // Show error toast or message
    } finally {
      setCancellingOrderId(null);
    }
  }, [user?.id]);
  
  // Delete order
  const deleteOrder = useCallback(async (orderId: string) => {
    if (!user?.id) return;
    
    try {
      setCancellingOrderId(orderId);
      // Call API to delete order
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove order from list
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    } catch (err: any) {
      console.error('Error deleting order:', err);
      // Show error toast or message
    } finally {
      setCancellingOrderId(null);
    }
  }, [user?.id]);
  
  // View order details in modal
  const viewOrderDetails = useCallback((orderId: string) => {
    // Find the selected order
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowOrderDetails(true);
    }
  }, [orders]);

  // Scroll functions for categories
  const scrollCategories = (direction: 'left' | 'right') => {
    const container = categoriesScrollRef.current;
    if (!container) return;

    const scrollAmount = 200;
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  const scrollSubcategories = (direction: 'left' | 'right') => {
    const container = subcategoriesScrollRef.current;
    if (!container) return;

    const scrollAmount = 200;
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  // Check scroll positions
  const checkScrollPosition = (container: HTMLDivElement, setCanScrollLeft: (value: boolean) => void, setCanScrollRight: (value: boolean) => void) => {
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Handle scroll events
  const handleCategoriesScroll = () => {
    checkScrollPosition(categoriesScrollRef.current!, setCanScrollCategoriesLeft, setCanScrollCategoriesRight);
  };

  const handleSubcategoriesScroll = () => {
    checkScrollPosition(subcategoriesScrollRef.current!, setCanScrollSubcategoriesLeft, setCanScrollSubcategoriesRight);
  };

  // Initialize scroll positions
  useEffect(() => {
    const categoriesContainer = categoriesScrollRef.current;
    const subcategoriesContainer = subcategoriesScrollRef.current;

    if (categoriesContainer) {
      checkScrollPosition(categoriesContainer, setCanScrollCategoriesLeft, setCanScrollCategoriesRight);
      categoriesContainer.addEventListener('scroll', handleCategoriesScroll);
    }

    if (subcategoriesContainer) {
      checkScrollPosition(subcategoriesContainer, setCanScrollSubcategoriesLeft, setCanScrollSubcategoriesRight);
      subcategoriesContainer.addEventListener('scroll', handleSubcategoriesScroll);
    }

    return () => {
      if (categoriesContainer) {
        categoriesContainer.removeEventListener('scroll', handleCategoriesScroll);
      }
      if (subcategoriesContainer) {
        subcategoriesContainer.removeEventListener('scroll', handleSubcategoriesScroll);
      }
    };
  }, [activeCategory]); // Re-run when category changes to update subcategories scroll

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);
  
  // Effect to update subcategories when category changes
  useEffect(() => {
    if (activeCategory !== 'All Products') {
      // Log available subcategories for this category
      const subcategories = getSubcategories(activeCategory);
      console.log(`Available subcategories for ${activeCategory}:`, subcategories);
      
      // Check if products have these subcategories
      const productSubcategories = [...new Set(
        products
          .filter(p => p.category.toLowerCase() === activeCategory.toLowerCase())
          .map(p => p.subcategory)
      )];
      
      console.log(`Subcategories found in products for ${activeCategory}:`, productSubcategories);
      
      // Check for mismatches
      const missingInProducts = subcategories.filter(
        sub => !productSubcategories.some(prodSub =>
          prodSub.toLowerCase() === sub.toLowerCase()
        )
      );
      
      const missingInDefinitions = productSubcategories.filter(
        prodSub => !subcategories.some(sub =>
          sub.toLowerCase() === prodSub.toLowerCase()
        )
      );
      
      if (missingInProducts.length > 0) {
        console.warn(`Subcategories defined but not found in products:`, missingInProducts);
      }
      
      if (missingInDefinitions.length > 0) {
        console.warn(`Subcategories in products but not defined:`, missingInDefinitions);
      }
    }
  }, [activeCategory, products]);

  useEffect(() => {
    const urlSearchQuery = searchParams.get('search');
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  // Filter and sort products with comprehensive filtering
  const filteredProducts = React.useMemo(() => {
    let filtered = [...products];
    
    console.log(`Filtering ${filtered.length} products with category: "${activeCategory}", subcategory: "${activeSubcategory}"`);

    // Special handling for Plants & Gardening category
    const isPlantsCategory = activeCategory.toLowerCase().includes('plants') ||
                            activeCategory.toLowerCase().includes('gardening');
    
    // Apply comprehensive filters with improved case-insensitive matching
    const currentFilters: ProductFilters = {
      category: activeCategory === 'All Products' ? undefined : activeCategory,
      subcategory: activeSubcategory || undefined,
      priceRange: selectedPriceRanges.length > 0 ? {
        min: Math.min(...selectedPriceRanges.map(range => {
          const priceRange = priceRanges.find(pr => pr.label === range);
          return priceRange ? priceRange.min : 0;
        })),
        max: Math.max(...selectedPriceRanges.map(range => {
          const priceRange = priceRanges.find(pr => pr.label === range);
          return priceRange ? priceRange.max : Infinity;
        }))
      } : undefined,
      availability: availabilityFilter === 'all' ? undefined : availabilityFilter,
      isOrganic: organicFilter === 'all' ? undefined : organicFilter === 'organic',
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      rating: selectedRating || undefined,
      useCaseInsensitiveMatch: true, // Enable case-insensitive matching
      usePartialMatching: isPlantsCategory // Enable partial matching for Plants & Gardening
    };

    filtered = filterProducts(filtered, currentFilters);
    console.log(`After filtering: ${filtered.length} products match the criteria`);
    
    // If we're in Plants & Gardening category and have no results, try a broader search
    if (isPlantsCategory && filtered.length === 0 && activeSubcategory) {
      console.log(`No products found for subcategory "${activeSubcategory}". Trying broader search...`);
      
      // Try matching by partial subcategory name
      filtered = products.filter(product =>
        product.category.toLowerCase().includes(activeCategory.toLowerCase()) &&
        (product.subcategory.toLowerCase().includes(activeSubcategory.toLowerCase()) ||
         activeSubcategory.toLowerCase().includes(product.subcategory.toLowerCase()))
      );
      
      console.log(`Broader search found ${filtered.length} products`);
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // Assuming products have a date field or use reverse order
        filtered.reverse();
        break;
      case 'popular':
      default:
        // Keep original order (assumed to be popular)
        break;
    }

    return filtered;
  }, [products, sortBy, activeCategory, activeSubcategory, selectedPriceRanges, availabilityFilter, organicFilter, selectedTags, selectedRating]);

  const clearFilters = () => {
    setActiveCategory('All Products');
    setActiveSubcategory('');
    setSearchQuery('');
    setSelectedPriceRanges([]);
    setSelectedTags([]);
    setSelectedRating(null);
    setOrganicFilter('all');
    setAvailabilityFilter('all');
    navigate('/shop', { replace: true });
  };

  return (
    <>
      <style>{`
        @keyframes fadeInOut {
          0% { 
            opacity: 0; 
            transform: translateY(8px);
            filter: blur(2px);
          }
          15% { 
            opacity: 1; 
            transform: translateY(0);
            filter: blur(0px);
          }
          85% { 
            opacity: 1; 
            transform: translateY(0);
            filter: blur(0px);
          }
          100% { 
            opacity: 0; 
            transform: translateY(-8px);
            filter: blur(2px);
          }
        }
        
        @keyframes headerLoadingPulse {
          0% {
            opacity: 0.95;
            box-shadow: 0 0 0 0 rgba(17, 185, 129, 0.1);
          }
          50% {
            opacity: 1;
            box-shadow: 0 2px 12px 0 rgba(17, 185, 129, 0.15);
          }
          100% {
            opacity: 0.95;
            box-shadow: 0 0 0 0 rgba(17, 185, 129, 0.1);
          }
        }
        
        .header-loading-animation {
          animation: headerLoadingPulse 1.5s ease-in-out infinite;
        }
        
        .search-placeholder {
          animation: fadeInOut 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced scrollbar hiding and smooth scrolling */
        .category-scroll-container {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
        }

        .category-scroll-container::-webkit-scrollbar {
          display: none;
        }

        /* Gradient fade effects for scroll arrows */
        .scroll-fade-left {
          background: linear-gradient(to right, rgba(26, 31, 46, 1) 0%, rgba(26, 31, 46, 0.8) 50%, rgba(26, 31, 46, 0) 100%);
        }

        .scroll-fade-right {
          background: linear-gradient(to left, rgba(26, 31, 46, 1) 0%, rgba(26, 31, 46, 0.8) 50%, rgba(26, 31, 46, 0) 100%);
        }
      `}</style>
      <div className="flex flex-col h-screen bg-[#1E2735] relative">
      {/* Combined Header Container - Breadcrumb, Actions, Categories, and Sort */}
      <div className={cn(
        "z-[40] bg-gradient-to-b from-[#1E2735] to-[#1A1F2E] border-b border-[#2A3143] transition-all duration-300",
        isMobile ? "fixed left-0 right-0 shadow-xl" : "fixed top-0 left-0 right-0 shadow-lg" /* Remove top positioning to eliminate gap */
      )} style={isMobile ? {
        top: isSmallMobile ? "48px" : "60px", // Exact height calculation: small mobile (py-2 + content) vs regular mobile (py-3 + content)
        minHeight: "auto",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      } : { marginLeft: "5.7rem", minHeight: "112px" }}>
        {/* Breadcrumb and Actions Row */}
        <div className={cn(
          isMobile ? "px-4 py-2.5" : "px-8 py-2.5" // Increased vertical padding for mobile for better spacing
        )}>
          <div className="flex items-center justify-between">
            {/* Left - Breadcrumb */}
            <div className="flex items-center gap-1 text-gray-400 flex-shrink-0"> 
              <button 
                onClick={() => navigate("/")}
                className="hover:text-white transition-all duration-200 p-1 rounded-md hover:bg-[#2A3143]"
                aria-label="Home"
              >
                <Home size={isMobile ? 16 : 18} className="flex-shrink-0" />
              </button>
              <ChevronRight size={isMobile ? 12 : 14} className="text-gray-500 flex-shrink-0" />
              <span className={cn("text-white font-semibold truncate", isMobile ? "text-sm" : "text-base")}>Shop</span>
            </div>

            {/* Center-Right - Search */}
            {!isMobile ? (
              <div className="flex-1 flex justify-center ml-8 mr-8">
                <div className="relative w-full max-w-[550px]">
                  <Search size={22} className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder=""
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gradient-to-r from-[#10141E] to-[#0F1318] border border-[#2A3143] rounded-xl pl-14 pr-6 py-3.5 text-white placeholder-transparent focus:border-cropsay-green focus:ring-2 focus:ring-cropsay-green/25 outline-none transition-all duration-300 hover:border-gray-300 shadow-lg hover:shadow-xl"
                    style={{
                      fontSize: '16px',
                      fontWeight: '400'
                    }}
                  />
                  {/* Animated placeholder overlay */}
                  {!searchQuery && (
                    <div className="absolute left-12 top-1/2 transform -translate-y-1/2 pointer-events-none overflow-hidden">
                      <span 
                        key={currentPlaceholderIndex}
                        className="text-gray-400 block search-placeholder"
                        style={{
                          fontSize: '16px',
                          fontWeight: '400',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {searchSuggestions[currentPlaceholderIndex]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Mobile search - hidden but implemented for consistency
              <div className="sr-only">
                <input
                  type="text"
                  placeholder="Search products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            {/* Right - Filter and Orders */}
            <div className="flex items-center gap-1.5 flex-shrink-0"> {/* Tighter spacing for mobile */}
              <button
                onClick={() => setShowFilters(true)}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 text-white border border-[#2A3143] bg-gradient-to-b from-[#10141E] to-[#0D1015] hover:from-[#2A3143] hover:to-[#242936] shadow-md hover:shadow-lg",
                  isMobile ? "p-2.5" : "gap-2 px-3 py-2" // Better touch target for mobile
                )}
                aria-label="Filter products"
              >
                <Filter size={isMobile ? 16 : 18} className="flex-shrink-0" />
                {!isMobile && <span className="font-medium">Filter</span>}
              </button>
              <button
                onClick={() => {
                  if (isMobile) {
                    setShowOrders(true);
                    loadOrders();
                  } else {
                    navigate("/orders");
                  }
                }}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 text-white border border-[#2A3143] bg-gradient-to-b from-[#10141E] to-[#0D1015] hover:from-[#2A3143] hover:to-[#242936] shadow-md hover:shadow-lg",
                  isMobile ? "p-2.5" : "gap-2 px-3 py-2" // Better touch target for mobile
                )}
                aria-label="View orders"
              >
                <ShoppingBag size={isMobile ? 16 : 18} className="flex-shrink-0" />
                {!isMobile && <span className="font-medium">Orders</span>}
              </button>
              {/* Only show cart icon on desktop */}
              {!isMobile && (
                <button
                  onClick={openCart}
                  className="relative p-2.5 bg-gradient-to-b from-[#10141E] to-[#0D1015] hover:from-[#2A3143] hover:to-[#242936] rounded-xl transition-all duration-200 border border-[#2A3143] shadow-md hover:shadow-lg"
                >
                  <ShoppingCartIcon size={20} className="text-white" />
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-cropsay-green to-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg">
                      {items.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories, Product count and Sort row */}
        <div className={cn(
          "border-t border-[#2A3143] bg-gradient-to-b from-[#1A1F2E] to-[#171C29] backdrop-blur-sm",
          isMobile ? "px-4 py-3" : "px-8 py-2" // Increased padding for mobile for better spacing
        )}>
          {/* Mobile layout - stacked */}
          {isMobile ? (
            <div className="flex flex-col space-y-2.5 min-h-[76px]"> {/* Increased spacing and min-height for better mobile UX */}
              {/* Categories */}
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-1 px-1"> {/* Increased spacing between category buttons */}
                <button
                  onClick={() => {
                    setActiveCategory('All Products');
                    setActiveSubcategory('');
                  }}
                  className={cn(
                    "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border-2 shadow-lg transform active:scale-95", // Enhanced mobile styling
                    activeCategory === 'All Products'
                      ? "bg-gradient-to-r from-[#4A5568] to-[#525866] text-white border-[#4A5568] shadow-[#4A5568]/25"
                      : "bg-gradient-to-r from-[#1A1F2E] to-[#171C29] text-gray-300 border-[#2A3143] active:bg-[#2A3143]"
                  )}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      // Only reset subcategory when changing to a different category
                      if (activeCategory !== category) {
                        setActiveCategory(category);
                        setActiveSubcategory(''); // Reset subcategory when changing category
                      }
                    }}
                    className={cn(
                      "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border-2 flex items-center gap-1.5 shadow-lg transform active:scale-95", // Enhanced mobile styling
                      activeCategory === category
                        ? "bg-gradient-to-r from-cropsay-green to-green-500 text-white border-cropsay-green shadow-cropsay-green/25"
                        : "bg-gradient-to-r from-[#1A1F2E] to-[#171C29] text-gray-300 border-[#2A3143] active:bg-[#2A3143]"
                    )}
                  >
                    {category === 'Seeds' && <Leaf size={16} className="flex-shrink-0" />}
                    {category === 'Crop Protection' && <Zap size={16} className="flex-shrink-0" />}
                    {category === 'Crop Nutrition' && <Zap size={16} className="flex-shrink-0" />}
                    {category === 'Equipments' && <Wrench size={16} className="flex-shrink-0" />}
                    {category === 'Tools & Equipment' && <Wrench size={16} className="flex-shrink-0" />}
                    <span className="truncate">{category}</span>
                  </button>
                ))}
              </div>

              {/* Subcategories - Show when a category is selected */}
              {activeCategory !== 'All Products' && (
                <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-1 px-1 mt-2">
                  <button
                    onClick={() => setActiveSubcategory('')}
                    className={cn(
                      "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 border-2 shadow-md transform active:scale-95",
                      activeSubcategory === ''
                        ? "bg-gradient-to-r from-[#4A5568] to-[#525866] text-white border-[#4A5568] shadow-[#4A5568]/20"
                        : "bg-gradient-to-r from-[#1A1F2E] to-[#171C29] text-gray-400 border-[#2A3143] active:bg-[#2A3143]"
                    )}
                  >
                    All {activeCategory}
                  </button>
                  {getSubcategories(activeCategory).map(subcategory => (
                    <button
                      key={subcategory}
                      onClick={() => setActiveSubcategory(subcategory)}
                      className={cn(
                        "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 border-2 shadow-md transform active:scale-95",
                        activeSubcategory === subcategory
                          ? "bg-gradient-to-r from-cropsay-green to-green-500 text-white border-cropsay-green shadow-cropsay-green/20"
                          : "bg-gradient-to-r from-[#1A1F2E] to-[#171C29] text-gray-400 border-[#2A3143] active:bg-[#2A3143]"
                      )}
                    >
                      <span className="truncate">{subcategory}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Product count and Sort */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 font-medium whitespace-nowrap">
                  {filteredProducts.length} products
                </p>
                <div className="flex items-center gap-2 ml-2"> {/* Increased gap for better mobile spacing */}
                  <span className="text-sm text-gray-400 font-medium whitespace-nowrap">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'popular' | 'price-low' | 'price-high' | 'newest')}
                    className="bg-gradient-to-b from-[#10141E] to-[#0D1015] border border-[#2A3143] rounded-lg px-2.5 py-1 text-sm text-white focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none min-w-[100px] shadow-sm"
                  >
                    <option value="popular">Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop layout - Categories and subcategories */
            <div className="space-y-3">
              {/* Main Categories Row */}
              <div className="flex items-center justify-between">
                {/* Categories with Scroll Arrows - Left */}
                <div className="relative flex items-center max-w-[75%] transition-all duration-300">
                  {/* Left Arrow */}
                  <button
                    onClick={() => scrollCategories('left')}
                    className={cn(
                      "absolute left-0 z-10 p-2 rounded-full scroll-fade-left transition-all duration-200 hover:bg-[#2A3143]",
                      canScrollCategoriesLeft
                        ? "opacity-100 cursor-pointer"
                        : "opacity-0 cursor-default pointer-events-none"
                    )}
                    disabled={!canScrollCategoriesLeft}
                  >
                    <ChevronLeft size={18} className="text-gray-300 hover:text-white" />
                  </button>

                  {/* Categories Container */}
                  <div
                    ref={categoriesScrollRef}
                    className="flex gap-3 overflow-x-auto category-scroll-container px-8 transition-all duration-300"
                  >
                    <button
                      onClick={() => {
                        setActiveCategory('All Products');
                        setActiveSubcategory('');
                      }}
                      className={cn(
                        "flex-shrink-0 px-5 py-2 rounded-xl text-base font-semibold transition-all duration-300 border-2 shadow-lg hover:shadow-xl transform hover:scale-105",
                        activeCategory === 'All Products'
                          ? "bg-gradient-to-r from-[#4A5568] to-[#525866] text-white border-[#4A5568] shadow-[#4A5568]/25"
                          : "bg-gradient-to-r from-[#1A1F2E] to-[#171C29] text-gray-300 hover:text-white border-[#2A3143] hover:border-[#3A4153] hover:from-[#2A3143] hover:to-[#242936]"
                      )}
                    >
                      All
                    </button>
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => {
                          // Only reset subcategory when changing to a different category
                          if (activeCategory !== category) {
                            setActiveCategory(category);
                            setActiveSubcategory(''); // Reset subcategory when changing category
                          }
                        }}
                        className={cn(
                          "flex-shrink-0 px-5 py-2 rounded-xl text-base font-semibold transition-all duration-300 border-2 flex items-center gap-2.5 shadow-lg hover:shadow-xl transform hover:scale-105",
                          activeCategory === category
                            ? "bg-gradient-to-r from-cropsay-green to-green-500 text-white border-cropsay-green shadow-cropsay-green/25"
                            : "bg-gradient-to-r from-[#1A1F2E] to-[#171C29] text-gray-300 hover:text-white border-[#2A3143] hover:border-[#3A4153] hover:from-[#2A3143] hover:to-[#242936]"
                        )}
                      >
                        {category === 'Seeds' && <Leaf size={18} className="flex-shrink-0" />}
                        {category === 'Crop Protection' && <Zap size={18} className="flex-shrink-0" />}
                        {category === 'Crop Nutrition' && <Zap size={18} className="flex-shrink-0" />}
                        {category === 'Equipments' && <Wrench size={18} className="flex-shrink-0" />}
                        {category === 'Tools & Equipment' && <Wrench size={18} className="flex-shrink-0" />}
                        <span className="truncate">{category}</span>
                      </button>
                    ))}
                  </div>

                  {/* Right Arrow */}
                  <button
                    onClick={() => scrollCategories('right')}
                    className={cn(
                      "absolute right-0 z-10 p-2 rounded-full scroll-fade-right transition-all duration-200 hover:bg-[#2A3143]",
                      canScrollCategoriesRight
                        ? "opacity-100 cursor-pointer"
                        : "opacity-0 cursor-default pointer-events-none"
                    )}
                    disabled={!canScrollCategoriesRight}
                  >
                    <ChevronRight size={18} className="text-gray-300 hover:text-white" />
                  </button>
                </div>

                {/* Right side - Product count and Sort in a single line */}
                <div className="flex items-center gap-5 flex-shrink-0">
                  {/* Product count */}
                  <p className="text-base text-gray-400 whitespace-nowrap font-medium">
                    {filteredProducts.length} products
                  </p>

                  {/* Sort */}
                  <div className="flex items-center gap-3">
                    <span className="text-base text-gray-400 font-medium">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'popular' | 'price-low' | 'price-high' | 'newest')}
                      className="bg-[#10141E] border border-[#2A3143] rounded-lg px-3 py-1.5 text-base text-white focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none w-[130px]"
                    >
                      <option value="popular">Popular</option>
                      <option value="price-low">Price: Low</option>
                      <option value="price-high">Price: High</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Subcategories Row with Scroll Arrows - Show when a category is selected */}
              {activeCategory !== 'All Products' && (
                <div className="relative flex items-center">
                  {/* Left Arrow */}
                  <button
                    onClick={() => scrollSubcategories('left')}
                    className={cn(
                      "absolute left-0 z-10 p-1.5 rounded-full scroll-fade-left transition-all duration-200 hover:bg-[#2A3143]",
                      canScrollSubcategoriesLeft
                        ? "opacity-100 cursor-pointer"
                        : "opacity-0 cursor-default pointer-events-none"
                    )}
                    disabled={!canScrollSubcategoriesLeft}
                  >
                    <ChevronLeft size={16} className="text-gray-400 hover:text-white" />
                  </button>

                  {/* Subcategories Container */}
                  <div
                    ref={subcategoriesScrollRef}
                    className="flex gap-2.5 overflow-x-auto category-scroll-container px-6 transition-all duration-300"
                  >
                    <button
                      onClick={() => setActiveSubcategory('')}
                      className={cn(
                        "flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 border shadow-md hover:shadow-lg transform hover:scale-105",
                        activeSubcategory === ''
                          ? "bg-gradient-to-r from-[#4A5568] to-[#525866] text-white border-[#4A5568] shadow-[#4A5568]/20"
                          : "bg-gradient-to-r from-[#1A1F2E] to-[#171C29] text-gray-400 hover:text-white border-[#2A3143] hover:border-[#3A4153] hover:from-[#2A3143] hover:to-[#242936]"
                      )}
                    >
                      All {activeCategory}
                    </button>
                    {getSubcategories(activeCategory).map(subcategory => (
                      <button
                        key={subcategory}
                        onClick={() => setActiveSubcategory(subcategory)}
                        className={cn(
                          "flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 border shadow-md hover:shadow-lg transform hover:scale-105",
                          activeSubcategory === subcategory
                            ? "bg-gradient-to-r from-cropsay-green to-green-500 text-white border-cropsay-green shadow-cropsay-green/20"
                            : "bg-gradient-to-r from-[#1A1F2E] to-[#171C29] text-gray-400 hover:text-white border-[#2A3143] hover:border-[#3A4153] hover:from-[#2A3143] hover:to-[#242936]"
                        )}
                      >
                        <span className="truncate">{subcategory}</span>
                      </button>
                    ))}
                  </div>

                  {/* Right Arrow */}
                  <button
                    onClick={() => scrollSubcategories('right')}
                    className={cn(
                      "absolute right-0 z-10 p-1.5 rounded-full scroll-fade-right transition-all duration-200 hover:bg-[#2A3143]",
                      canScrollSubcategoriesRight
                        ? "opacity-100 cursor-pointer"
                        : "opacity-0 cursor-default pointer-events-none"
                    )}
                    disabled={!canScrollSubcategoriesRight}
                  >
                    <ChevronRight size={16} className="text-gray-400 hover:text-white" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Products Grid - Only this section scrollable */}
      <div className="flex-1" style={{
        // Increase padding when subcategories are shown
        paddingTop: isMobile
          ? (isSmallMobile
              ? (activeCategory !== 'All Products' ? "190px" : "150px") // Increased padding for mobile
              : (activeCategory !== 'All Products' ? "202px" : "162px")) // Increased padding for mobile
          : (activeCategory !== 'All Products'
              ? "calc(64px + 48px + 16px + 48px)" // Increased padding for desktop
              : "calc(64px + 48px + 16px + 8px)"), // Added small padding for desktop
      }}>
        <div className="h-full overflow-y-auto custom-scrollbar product-container">
          <div className={cn(
            isMobile ? "p-3 pb-28" : "p-4 pb-16 px-8" // Extra bottom padding for mobile to prevent content from being hidden
          )}>
            {isLoading ? (
              <div className="w-full mt-2">
                {/* Loading indicator at the top */}
                <div className="w-full flex justify-center items-center mb-4">
                  <div className="h-1 bg-cropsay-green/20 rounded-full w-full max-w-md overflow-hidden relative">
                    <div className="h-full bg-cropsay-green absolute left-0 top-0 animate-pulse" style={{ width: '30%', animationDuration: '1.5s' }}></div>
                  </div>
                </div>
                {/* Skeleton loading for products */}
                <div className={cn(
                  "grid gap-4",
                  isMobile 
                    ? "grid-cols-2 gap-3" 
                    : "grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                )}>
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="bg-[#1A1F2E] rounded-lg overflow-hidden shadow-md border border-[#2A3143] animate-pulse">
                      {/* Image placeholder */}
                      <div className="w-full aspect-square bg-[#2A3143]"></div>
                      {/* Product title */}
                      <div className="p-3 space-y-2">
                        <div className="h-5 bg-[#2A3143] rounded w-3/4"></div>
                        {/* Category */}
                        <div className="h-4 bg-[#2A3143] rounded w-1/2 opacity-70"></div>
                        {/* Price */}
                        <div className="h-6 bg-[#2A3143] rounded w-1/3 mt-2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-400">
                <p className="mb-2">Error loading products</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-sm underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Package size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-lg mb-1">No products found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
                {(searchQuery || activeCategory !== 'All Products') && (
                  <button
                    onClick={clearFilters}
                    className="text-cropsay-green hover:underline text-sm mt-2"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className={cn(
                "grid",
                isMobile
                  ? "grid-cols-2 gap-3" // Tighter gap for mobile
                  : "grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7" // Responsive breakpoints
              )}
              style={{ minHeight: "calc(100vh - 300px)" }} // Ensure grid has minimum height to show scrollbar
              >
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-[90] flex" onClick={() => setShowFilters(false)}>
          <div 
            className="bg-[#1E2735] w-full max-w-sm ml-auto h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Filter Header */}
            <div className="sticky top-0 z-50 bg-[#1E2735] border-b border-[#2A3143] p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Filter size={20} />
                Filters
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-cropsay-green hover:underline"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-[#2A3143] rounded-full text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="p-4 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-base font-medium text-white mb-3">Categories</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={activeCategory === 'All Products'}
                      onChange={() => {
                        setActiveCategory('All Products');
                        setActiveSubcategory('');
                      }}
                      className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143]"
                    />
                    <span className="ml-2 text-sm text-gray-300">All</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={activeCategory === category}
                        onChange={() => {
                          setActiveCategory(category);
                          setActiveSubcategory(''); // Reset subcategory when changing category
                        }}
                        className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143]"
                      />
                      <span className="ml-2 text-sm text-gray-300 flex items-center gap-2">
                        {category === 'Seeds' && <Leaf size={16} className="text-cropsay-green" />}
                        {category === 'Crop Protection' && <Zap size={16} className="text-cropsay-green" />}
                        {category === 'Crop Nutrition' && <Zap size={16} className="text-cropsay-green" />}
                        {category === 'Equipments' && <Wrench size={16} className="text-cropsay-green" />}
                        {category === 'Tools & Equipment' && <Wrench size={16} className="text-cropsay-green" />}
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subcategories - Show when a category is selected */}
              {activeCategory !== 'All Products' && (
                <div>
                  <h3 className="text-base font-medium text-white mb-3">Subcategories</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="subcategory"
                        checked={activeSubcategory === ''}
                        onChange={() => setActiveSubcategory('')}
                        className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143]"
                      />
                      <span className="ml-2 text-sm text-gray-300">All {activeCategory}</span>
                    </label>
                    {getSubcategories(activeCategory).map((subcategory) => (
                      <label key={subcategory} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="subcategory"
                          checked={activeSubcategory === subcategory}
                          onChange={() => setActiveSubcategory(subcategory)}
                          className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143]"
                        />
                        <span className="ml-2 text-sm text-gray-300">{subcategory}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h3 className="text-base font-medium text-white mb-3">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label key={range.label} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPriceRanges.includes(range.label)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPriceRanges([...selectedPriceRanges, range.label]);
                          } else {
                            setSelectedPriceRanges(selectedPriceRanges.filter(r => r !== range.label));
                          }
                        }}
                        className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143] rounded"
                      />
                      <span className="ml-2 text-sm text-gray-300">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-base font-medium text-white mb-3">Availability</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      checked={availabilityFilter === 'all'}
                      onChange={() => setAvailabilityFilter('all')}
                      className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143]"
                    />
                    <span className="ml-2 text-sm text-gray-300">All Products</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      checked={availabilityFilter === 'in_stock'}
                      onChange={() => setAvailabilityFilter('in_stock')}
                      className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143]"
                    />
                    <span className="ml-2 text-sm text-gray-300">In Stock</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      checked={availabilityFilter === 'out_of_stock'}
                      onChange={() => setAvailabilityFilter('out_of_stock')}
                      className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143]"
                    />
                    <span className="ml-2 text-sm text-gray-300">Out of Stock</span>
                  </label>
                </div>
              </div>

              {/* Organic/Non-Organic */}
              <div>
                <h3 className="text-base font-medium text-white mb-3">Organic</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="organic"
                      checked={organicFilter === 'all'}
                      onChange={() => setOrganicFilter('all')}
                      className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143]"
                    />
                    <span className="ml-2 text-sm text-gray-300">All Products</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="organic"
                      checked={organicFilter === 'organic'}
                      onChange={() => setOrganicFilter('organic')}
                      className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143]"
                    />
                    <span className="ml-2 text-sm text-gray-300">Organic Only</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="organic"
                      checked={organicFilter === 'non-organic'}
                      onChange={() => setOrganicFilter('non-organic')}
                      className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143]"
                    />
                    <span className="ml-2 text-sm text-gray-300">Non-Organic</span>
                  </label>
                </div>
              </div>

              {/* Product Tags */}
              <div>
                <h3 className="text-base font-medium text-white mb-3">Product Tags</h3>
                <div className="space-y-2">
                  {availableTags.map((tag) => (
                    <label key={tag} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTags([...selectedTags, tag]);
                          } else {
                            setSelectedTags(selectedTags.filter(t => t !== tag));
                          }
                        }}
                        className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143] rounded"
                      />
                      <span className="ml-2 text-sm text-gray-300">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-base font-medium text-white mb-3">Rating</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === null}
                      onChange={() => setSelectedRating(null)}
                      className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143]"
                    />
                    <span className="ml-2 text-sm text-gray-300">All Ratings</span>
                  </label>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={selectedRating === rating}
                        onChange={() => setSelectedRating(rating)}
                        className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143]"
                      />
                      <span className="ml-2 text-sm text-gray-300 flex items-center gap-1">
                        {Array.from({ length: rating }, (_, i) => (
                          <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="ml-1">& up</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Modal (Mobile) - Same as profile popup */}
      {showOrders && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-[90] flex items-start justify-center pt-16" onClick={() => setShowOrders(false)}>
          <div 
            className="bg-[#1E2735] w-10/12 max-w-xs rounded-lg overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Orders Header */}
            <div className="bg-[#1E2735] px-3 py-2 border-b border-[#2A3143] flex items-center justify-between sticky top-0 z-50">
              <div>
                <h2 className="text-base font-semibold text-white">My Orders</h2>
                <p className="text-xs text-gray-400">Order history and status</p>
              </div>
              <button
                onClick={() => setShowOrders(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#2A3143]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Orders Content */}
            <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
              {!user ? (
                <div className="text-center py-6">
                  <div className="text-gray-400 mb-3">
                    <ShoppingBag size={36} className="mx-auto mb-2 opacity-50" />
                    <p className="text-base mb-1">Please log in</p>
                    <p className="text-xs">You need to be logged in to view your orders</p>
                  </div>
                </div>
              ) : ordersLoading ? (
                <div className="flex justify-center items-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent border-cropsay-green"></div>
                </div>
              ) : ordersError ? (
                <div className="text-center py-6">
                  <div className="text-red-400 mb-3">
                    <p className="text-base mb-1">Error loading orders</p>
                    <p className="text-xs">{ordersError}</p>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-gray-400 mb-3">
                    <ShoppingBag size={36} className="mx-auto mb-2 opacity-50" />
                    <p className="text-base mb-1">No orders yet</p>
                    <p className="text-xs">Your order history will appear here</p>
                  </div>
                </div>
              ) : (
                <div>
                  {orders.map(order => (
                    <div key={order.id} className="px-3 py-2 border-b border-[#2A3143]/50 last:border-b-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-xs font-medium text-white truncate">Order #{order.id?.slice(-6) || 'N/A'}</h3>
                        <span className="text-cropsay-green text-xs font-medium">₹{order.total}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1 mb-1">
                        <p className="text-[10px] text-gray-400">
                          {order.date ? new Date(order.date).toLocaleString('en-US', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'} · Items: {order.items?.length || 1}
                        </p>
                        
                        <span className={cn(
                          "text-[10px] font-medium",
                          order.status === 'Paid' || order.status === 'Delivered' 
                            ? 'text-green-400' 
                            : order.status === 'Pending' 
                            ? 'text-yellow-400' 
                            : order.status === 'Cancelled'
                            ? 'text-red-400'
                            : 'text-gray-400'
                        )}>
                          {order.status || 'Unknown'}
                        </span>
                      </div>
                      
                      <div className="flex justify-end items-center gap-1.5">
                        {order.status === 'Cancelled' ? (
                          <button
                            onClick={() => deleteOrder(order.id)}
                            disabled={cancellingOrderId === order.id}
                            className="bg-red-900/40 text-white hover:bg-red-900/60 text-[10px] py-0.5 px-2 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[45px]"
                          >
                            {cancellingOrderId === order.id ? (
                              <div className="h-2 w-2 border-[1.5px] border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              "Delete"
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            disabled={cancellingOrderId === order.id || order.status === 'Delivered'}
                            className={cn(
                              "bg-red-900/40 text-white hover:bg-red-900/60 text-[10px] py-0.5 px-2 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[45px]",
                              order.status === 'Delivered' && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {cancellingOrderId === order.id ? (
                              <div className="h-2 w-2 border-[1.5px] border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              "Cancel"
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => viewOrderDetails(order.id)}
                          className="bg-[#2A3143] text-white hover:bg-[#3A4453] text-[10px] py-0.5 px-2 rounded"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-[90] flex items-start justify-center pt-16" onClick={() => setShowOrderDetails(false)}>
          <div 
            className="bg-[#1E2735] w-10/12 max-w-xs rounded-lg overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Order Details Header */}
            <div className="bg-[#1E2735] px-3 py-2 border-b border-[#2A3143] flex items-center justify-between sticky top-0 z-50">
              <div>
                <h2 className="text-base font-semibold text-white">Order Details</h2>
                <p className="text-xs text-gray-400">Order #{selectedOrder.id?.slice(-6) || 'N/A'}</p>
              </div>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#2A3143]"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Order Details Content */}
            <div className="p-2 overflow-y-auto" style={{ maxHeight: "60vh" }}>
              {/* Order Status and Date */}
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className={cn(
                    "text-[10px] font-medium",
                    selectedOrder.status === 'Paid' || selectedOrder.status === 'Delivered' 
                      ? 'text-green-400' 
                      : selectedOrder.status === 'Pending' 
                      ? 'text-yellow-400' 
                      : selectedOrder.status === 'Cancelled'
                      ? 'text-red-400'
                      : 'text-gray-400'
                  )}>
                    {selectedOrder.status || 'Unknown'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">
                  {selectedOrder.date ? new Date(selectedOrder.date).toLocaleString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </p>
              </div>
              
              {/* Order Info */}
              <div className="space-y-1.5 mb-2">
                <div className="bg-[#232B3B] p-1.5 rounded">
                  <h3 className="text-[10px] font-medium text-gray-300">Payment Method</h3>
                  <p className="text-xs text-white">{selectedOrder.payment_method || 'COD'}</p>
                </div>
                
                <div className="bg-[#232B3B] p-1.5 rounded">
                  <h3 className="text-[10px] font-medium text-gray-300">Shipping Address</h3>
                  <p className="text-xs text-white">{selectedOrder.address || 'Not specified'}</p>
                </div>
                
                <div className="bg-[#232B3B] p-1.5 rounded">
                  <h3 className="text-[10px] font-medium text-gray-300">Contact</h3>
                  <p className="text-xs text-white">{selectedOrder.phone || 'Not specified'}</p>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="mb-2">
                <h3 className="text-[10px] font-medium text-gray-300 mb-1">Items</h3>
                {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between bg-[#232B3B] p-1.5 rounded">
                        <div>
                          <p className="text-xs text-white font-medium">{item.name}</p>
                          <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white">₹{item.price}</p>
                          <p className="text-[10px] text-gray-400">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No items in this order</p>
                )}
              </div>
              
              {/* Order Total */}
              <div className="border-t border-[#2A3143] pt-2 mb-2">
                <div className="flex justify-between">
                  <p className="text-[10px] text-gray-400">Subtotal</p>
                  <p className="text-xs text-white">₹{selectedOrder.total?.toLocaleString() || '0'}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-[10px] text-gray-400">Shipping</p>
                  <p className="text-xs text-white">₹0</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-[10px] text-gray-400">Tax</p>
                  <p className="text-xs text-white">Included</p>
                </div>
                <div className="flex justify-between font-medium mt-1">
                  <p className="text-xs text-white">Total</p>
                  <p className="text-sm text-cropsay-green font-medium">₹{selectedOrder.total?.toLocaleString() || '0'}</p>
                </div>
              </div>
              
              {/* Order Actions */}
              <div className="flex justify-end gap-1.5 mt-2">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="px-2 py-1 text-[10px] text-white bg-[#2A3143] hover:bg-[#3A4453] rounded"
                >
                  Close
                </button>
                
                {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
                  <button
                    onClick={() => {
                      cancelOrder(selectedOrder.id);
                      setShowOrderDetails(false);
                    }}
                    className="px-2 py-1 text-[10px] text-white bg-red-900/40 hover:bg-red-900/60 rounded"
                    disabled={cancellingOrderId === selectedOrder.id}
                  >
                    {cancellingOrderId === selectedOrder.id ? (
                      <div className="h-2 w-2 border-[1.5px] border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Cancel Order"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ShoppingCart />
    </div>
    </>
  );
};

export default ShopPage;
