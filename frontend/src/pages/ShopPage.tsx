import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ShoppingCartIcon, X, ShoppingBag, Home, ChevronRight, Leaf, Zap, Wrench, Package, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { CartItemQuantity, ShoppingCart, ShoppingCartButton } from '@/components/ShoppingCart';
import { getRecommendationsFromChat } from '@/services/recommendationService';
import { getCategories, getSubcategories, Product, getRecommendedProducts } from '@/data/productData';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  fetchProducts,
  searchProducts,
  getProductsByCategory,
  getNewestProducts
} from '@/services/productService';
import { getOrdersByUser } from '@/services/orderService';
import { testSupabaseConnection, testProductsAccess, insertTestProduct } from '@/services/testSupabase';
import ProductCard from '@/components/ProductCard';
import { useIsMobile } from '@/hooks/use-mobile';
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

  const { items, openCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();

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
      } else if (activeCategory === 'All Products') {
        fetchedProducts = await fetchProducts();
      } else {
        fetchedProducts = await getProductsByCategory(activeCategory);
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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const urlSearchQuery = searchParams.get('search');
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    let filtered = [...products];

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
  }, [products, sortBy]);

  const clearFilters = () => {
    setActiveCategory('All Products');
    setSearchQuery('');
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
        
        .search-placeholder {
          animation: fadeInOut 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
      <div className="flex flex-col h-screen bg-[#1E2735]">
      {/* Combined Header Container - Breadcrumb, Actions, Categories, and Sort */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-[100] bg-gradient-to-b from-[#1E2735] to-[#1A1F2E] border-b border-[#2A3143] shadow-lg",
      )} style={{ marginTop: "3rem" }}>
        {/* Breadcrumb and Actions Row */}
        <div className={cn(
          isMobile ? "px-4 py-1.5" : "px-8 py-1.5" // Consistent vertical padding with proper horizontal spacing
        )}>
          <div className="flex items-center justify-between">
            {/* Left - Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0"> 
              <button 
                onClick={() => navigate("/")}
                className="hover:text-white transition-all duration-200 p-1.5 rounded-md hover:bg-[#2A3143]"
                aria-label="Home"
              >
                <Home size={isMobile ? 16 : 18} className="flex-shrink-0" />
              </button>
              <ChevronRight size={isMobile ? 12 : 14} className="text-gray-500 flex-shrink-0" />
              <span className={cn("text-white font-semibold truncate", isMobile ? "text-sm" : "text-base")}>Shop</span>
            </div>

            {/* Center-Right - Search (Desktop only) */}
            {!isMobile && (
              <div className="flex-1 flex justify-center ml-8 mr-8">
                <div className="relative w-[600px] max-w-[600px]">
                  <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder=""
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gradient-to-r from-[#10141E] to-[#0F1318] border border-[#2A3143] rounded-xl pl-12 pr-6 py-4 text-white placeholder-transparent focus:border-cropsay-green focus:ring-2 focus:ring-cropsay-green/25 outline-none transition-all duration-300 hover:border-gray-300 shadow-lg hover:shadow-xl"
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
          isMobile ? "px-4 py-2" : "px-8 py-1.5" // Better padding for mobile
        )}>
          {/* Mobile layout - stacked */}
          {isMobile ? (
            <div className="flex flex-col space-y-2"> {/* Optimized spacing */}
              {/* Categories */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 -mx-1 px-1"> {/* Better overflow handling with padding */}
                <button
                  onClick={() => setActiveCategory('All Products')}
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border shadow-sm", // Better padding and animation
                    activeCategory === 'All Products'
                      ? "bg-gradient-to-r from-[#4A5568] to-[#525866] text-white border-[#4A5568] shadow-md"
                      : "bg-transparent text-gray-300 hover:bg-[#2A3143] border-[#2A3143] hover:shadow-sm"
                  )}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-1.5 shadow-sm", // Tighter gap for mobile
                      activeCategory === category
                        ? "bg-gradient-to-r from-cropsay-green to-green-500 text-white border-cropsay-green shadow-md"
                        : "bg-transparent text-gray-300 hover:bg-[#2A3143] border-[#2A3143] hover:shadow-sm"
                    )}
                  >
                    {category === 'Seeds' && <Leaf size={14} className="flex-shrink-0" />}
                    {category === 'Fertilizers' && <Zap size={14} className="flex-shrink-0" />}
                    {category === 'Tools' && <Wrench size={14} className="flex-shrink-0" />}
                    <span className="truncate">{category}</span>
                  </button>
                ))}
              </div>
              
              {/* Product count and Sort */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 font-medium whitespace-nowrap">
                  {filteredProducts.length} products
                </p>
                <div className="flex items-center gap-1.5 ml-2"> {/* Tighter gap for mobile */}
                  <span className="text-sm text-gray-400 font-medium whitespace-nowrap">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'popular' | 'price-low' | 'price-high' | 'newest')}
                    className="bg-gradient-to-b from-[#10141E] to-[#0D1015] border border-[#2A3143] rounded-lg px-2 py-1 text-sm text-white focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none min-w-[110px] shadow-sm"
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
            /* Desktop layout - categories, product count, and sort in one row */
            <div className="flex items-center justify-between">
              {/* Categories - Left */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
                <button
                  onClick={() => setActiveCategory('All Products')}
                  className={cn(
                    "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                    activeCategory === 'All Products'
                      ? "bg-[#4A5568] text-white border-[#4A5568]"
                      : "bg-transparent text-gray-300 hover:bg-[#2A3143] border-[#2A3143]"
                  )}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border flex items-center gap-2",
                      activeCategory === category
                        ? "bg-cropsay-green text-white border-cropsay-green"
                        : "bg-transparent text-gray-300 hover:bg-[#2A3143] border-[#2A3143]"
                    )}
                  >
                    {category === 'Seeds' && <Leaf size={16} />}
                    {category === 'Fertilizers' && <Zap size={16} />}
                    {category === 'Tools' && <Wrench size={16} />}
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Right side - Product count and Sort */}
              <div className="flex items-center gap-6 flex-shrink-0">
                {/* Product count */}
                <p className="text-sm text-gray-400 whitespace-nowrap">
                  {filteredProducts.length} products
                </p>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'popular' | 'price-low' | 'price-high' | 'newest')}
                    className="bg-[#10141E] border border-[#2A3143] rounded-lg px-3 py-1.5 text-sm text-white focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none min-w-[120px]"
                  >
                    <option value="popular">Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid - Only this section scrollable */}
      <div className="flex-1" style={{ 
        paddingTop: isMobile ? "calc(3rem + 56px + 64px)" : "calc(3rem + 64px + 56px)", /* Account for the 3rem margin plus header height */
      }}>
        <div className="h-full overflow-y-auto custom-scrollbar product-container">
          <div className={cn(
            isMobile ? "p-3 pb-28" : "p-4 pb-4 px-8" // More bottom padding for mobile navigation
          )}>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cropsay-green"></div>
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
              )}>
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
        <div className="fixed inset-0 bg-black/50 z-[101] flex" onClick={() => setShowFilters(false)}>
          <div 
            className="bg-[#1E2735] w-full max-w-sm ml-auto h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Filter Header */}
            <div className="sticky top-0 z-10 bg-[#1E2735] border-b border-[#2A3143] p-4 flex items-center justify-between">
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
                        setShowFilters(false);
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
                          setShowFilters(false);
                        }}
                        className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143]"
                      />
                      <span className="ml-2 text-sm text-gray-300 flex items-center gap-2">
                        {category === 'Seeds' && <Leaf size={16} className="text-cropsay-green" />}
                        {category === 'Fertilizers' && <Zap size={16} className="text-cropsay-green" />}
                        {category === 'Tools' && <Wrench size={16} className="text-cropsay-green" />}
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-base font-medium text-white mb-3">Price Range</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143] rounded"
                    />
                    <span className="ml-2 text-sm text-gray-300">Under ₹1,000</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143] rounded"
                    />
                    <span className="ml-2 text-sm text-gray-300">₹1,000 - ₹2,500</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143] rounded"
                    />
                    <span className="ml-2 text-sm text-gray-300">₹2,500 - ₹5,000</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143] rounded"
                    />
                    <span className="ml-2 text-sm text-gray-300">Above ₹5,000</span>
                  </label>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-base font-medium text-white mb-3">Rating</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-cropsay-green focus:ring-cropsay-green border-gray-400 bg-[#2A3143] rounded"
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
        <div className="fixed inset-0 bg-black/50 z-[101] flex items-start justify-center pt-16" onClick={() => setShowOrders(false)}>
          <div 
            className="bg-[#1E2735] w-10/12 max-w-xs rounded-lg overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Orders Header */}
            <div className="bg-[#1E2735] px-3 py-2 border-b border-[#2A3143] flex items-center justify-between sticky top-0 z-20">
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
        <div className="fixed inset-0 bg-black/50 z-[101] flex items-start justify-center pt-16" onClick={() => setShowOrderDetails(false)}>
          <div 
            className="bg-[#1E2735] w-10/12 max-w-xs rounded-lg overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Order Details Header */}
            <div className="bg-[#1E2735] px-3 py-2 border-b border-[#2A3143] flex items-center justify-between sticky top-0 z-20">
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
