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

  const { items, openCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();

  const categories = getCategories();

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
    <div className="min-h-screen bg-[#1E2735]">
      {/* Header - Breadcrumb and Actions */}
      <div className="sticky top-0 z-20 bg-[#1E2735] border-b border-[#2A3143]">
        {/* Breadcrumb and Actions Row */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left - Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <button 
                onClick={() => navigate("/")}
                className="hover:text-white transition-colors"
              >
                <Home size={16} />
              </button>
              <ChevronRight size={14} />
              <span className="text-white font-medium">Shop</span>
            </div>

            {/* Right - Filter and Orders */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#10141E] hover:bg-[#2A3143] rounded-lg transition-colors text-sm text-white border border-[#2A3143]"
              >
                <Filter size={16} />
                Filter
              </button>
              <button
                onClick={() => navigate("/orders")}
                className="flex items-center gap-2 px-3 py-2 bg-[#10141E] hover:bg-[#2A3143] rounded-lg transition-colors text-sm text-white border border-[#2A3143]"
              >
                <ShoppingBag size={16} />
                Orders
              </button>
              <button
                onClick={openCart}
                className="relative p-2 bg-[#10141E] hover:bg-[#2A3143] rounded-lg transition-colors border border-[#2A3143]"
              >
                <ShoppingCartIcon size={20} className="text-white" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cropsay-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {items.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for Greenhouse Equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#10141E] border border-[#2A3143] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
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
        </div>

        {/* Product count and Sort */}
        <div className="px-4 py-3 border-t border-[#2A3143] bg-[#1A1F2E]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {filteredProducts.length} products
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'popular' | 'price-low' | 'price-high' | 'newest')}
                className="bg-[#10141E] border border-[#2A3143] rounded-lg px-3 py-1.5 text-sm text-white focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none"
              >
                <option value="popular">Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid - Only this section scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar">
          <div className={cn(
            "p-4",
            isMobile ? "pb-20" : "pb-4"
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
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              )}>
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => setSelectedProduct(product)}
                    className="h-full"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex">
          <div className="bg-white w-full max-w-sm ml-auto h-full overflow-y-auto">
            {/* Filter Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter size={20} />
                Filters
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="p-4 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={activeCategory === 'All Products'}
                      onChange={() => setActiveCategory('All Products')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">All</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={activeCategory === category}
                        onChange={() => setActiveCategory(category)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                        {category === 'Seeds' && <Leaf size={16} />}
                        {category === 'Fertilizers' && <Zap size={16} />}
                        {category === 'Tools' && <Wrench size={16} />}
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Under ₹1,000</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">₹1,000 - ₹2,500</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">₹2,500 - ₹5,000</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Above ₹5,000</span>
                  </label>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Rating</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
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

      {/* Floating cart button for mobile view */}
      {isMobile && items.length > 0 && (
        <div className="fixed bottom-4 right-4 z-30">
          <button
            onClick={openCart}
            className="bg-cropsay-green text-white p-3 rounded-full shadow-lg hover:bg-cropsay-green/90 transition-colors relative"
          >
            <ShoppingCartIcon size={24} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {items.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </button>
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
                <div className="text-4xl mb-2">{selectedProduct.emoji}</div>
                <p className="text-gray-300 text-sm">{selectedProduct.description}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-cropsay-green">
                    ₹{selectedProduct.price.toLocaleString()}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="text-gray-400 line-through ml-2">
                      ₹{selectedProduct.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Category</p>
                  <p className="text-white">{selectedProduct.category}</p>
                </div>
              </div>

              <CartItemQuantity productId={selectedProduct.id} />
            </div>
          </div>
        </div>
      )}
      
      <ShoppingCart />
    </div>
  );
};

export default ShopPage;
