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
import { testSupabaseConnection, testProductsAccess, insertTestProduct } from '@/services/testSupabase';
import ProductCard from '@/components/ProductCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const ShopPage = () => {
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'newest'>('popular');
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

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
      <div className="min-h-screen bg-[#1E2735]">
      {/* Header - Breadcrumb and Actions */}
      <div className={cn(
        "sticky z-40 bg-gradient-to-b from-[#1E2735] to-[#1A1F2E] border-b border-[#2A3143] shadow-lg",
        isMobile ? "top-0 -mt-px" : "top-0" // Use negative margin instead of negative top
      )}>
        {/* Breadcrumb and Actions Row */}
        <div className={cn(
          isMobile ? "px-4 py-1" : "px-8 py-1.5" // Further reduced padding for less height
        )}>
          <div className="flex items-center justify-between">
            {/* Left - Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0"> {/* Increased gap for better spacing */}
              <button 
                onClick={() => navigate("/")}
                className="hover:text-white transition-all duration-200 p-1 rounded-md hover:bg-[#2A3143]" // Enhanced hover effect
              >
                <Home size={isMobile ? 16 : 18} /> {/* Slightly larger icons */}
              </button>
              <ChevronRight size={isMobile ? 12 : 14} className="text-gray-500" /> {/* Better color contrast */}
              <span className={cn("text-white font-semibold", isMobile ? "text-sm" : "text-base")}>Shop</span> {/* Improved typography */}
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
            <div className="flex items-center gap-2 flex-shrink-0"> {/* Better spacing */}
              <button
                onClick={() => setShowFilters(true)}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 text-white border border-[#2A3143] bg-gradient-to-b from-[#10141E] to-[#0D1015] hover:from-[#2A3143] hover:to-[#242936] shadow-md hover:shadow-lg",
                  isMobile ? "p-2" : "gap-2 px-3 py-2" // Better mobile padding
                )}
              >
                <Filter size={isMobile ? 16 : 18} />
                {!isMobile && <span className="font-medium">Filter</span>}
              </button>
              <button
                onClick={() => navigate("/orders")}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 text-white border border-[#2A3143] bg-gradient-to-b from-[#10141E] to-[#0D1015] hover:from-[#2A3143] hover:to-[#242936] shadow-md hover:shadow-lg",
                  isMobile ? "p-2" : "gap-2 px-3 py-2" // Better mobile padding
                )}
              >
                <ShoppingBag size={isMobile ? 16 : 18} />
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
          isMobile ? "px-4 py-1" : "px-8 py-1.5" // Further reduced padding for less height
        )}>
          {/* Mobile layout - stacked */}
          {isMobile ? (
            <div className="flex flex-col space-y-2.5"> {/* Better spacing */}
              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide"> {/* Better gap */}
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
                      "flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-2 shadow-sm", // Better styling
                      activeCategory === category
                        ? "bg-gradient-to-r from-cropsay-green to-green-500 text-white border-cropsay-green shadow-md"
                        : "bg-transparent text-gray-300 hover:bg-[#2A3143] border-[#2A3143] hover:shadow-sm"
                    )}
                  >
                    {category === 'Seeds' && <Leaf size={14} />} {/* Appropriate icon size */}
                    {category === 'Fertilizers' && <Zap size={14} />}
                    {category === 'Tools' && <Wrench size={14} />}
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Product count and Sort */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 font-medium"> {/* Better typography */}
                  {filteredProducts.length} products
                </p>
                <div className="flex items-center gap-2"> {/* Better gap */}
                  <span className="text-sm text-gray-400 font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'popular' | 'price-low' | 'price-high' | 'newest')}
                    className="bg-gradient-to-b from-[#10141E] to-[#0D1015] border border-[#2A3143] rounded-lg px-3 py-1 text-sm text-white focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none min-w-[110px] shadow-sm" // Better styling
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
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar">
          <div className={cn(
            "p-4",
            isMobile ? "pb-20" : "pb-4 px-8" // Add side padding for desktop
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
                "grid gap-4",
                isMobile 
                  ? "grid-cols-2" 
                  : "grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7" // Better responsive breakpoints
              )}>
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex" onClick={() => setShowFilters(false)}>
          <div 
            className="bg-[#1E2735] w-full max-w-sm ml-auto h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Filter Header */}
            <div className="sticky top-0 bg-[#1E2735] border-b border-[#2A3143] p-4 flex items-center justify-between">
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

      {/* Product detail modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-[#1E2735] rounded-lg p-6 max-w-md w-full border border-[#2A3143] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">{selectedProduct.name}</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#2A3143] rounded-lg p-4 text-center">
                <div className="text-4xl mb-2">🌱</div>
                <p className="text-gray-300 text-sm">{selectedProduct.description}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-cropsay-green">
                    ₹{selectedProduct.price.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Category</p>
                  <p className="text-white">{selectedProduct.category}</p>
                </div>
              </div>

              <CartItemQuantity 
                id={selectedProduct.id} 
                quantity={items.find(item => item.id === selectedProduct.id)?.quantity || 0}
              />
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
