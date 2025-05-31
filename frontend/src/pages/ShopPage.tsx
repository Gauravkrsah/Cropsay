import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ShoppingCartIcon, X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { CartItemQuantity, ShoppingCart, ShoppingCartButton } from '@/components/ShoppingCart';
import { getRecommendationsFromChat } from '@/services/recommendationService';
import { getCategories, getSubcategories, Product, getRecommendedProducts } from '@/data/productData';
import { useNavigate } from 'react-router-dom';
import { 
  fetchProducts, 
  searchProducts, 
  getProductsByCategory, 
  getNewestProducts 
} from '@/services/productService';
import { testSupabaseConnection, testProductsAccess, insertTestProduct } from '@/services/testSupabase';
import ProductCard from '@/components/ProductCard';

const ShopPage = () => {
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [activeSubcategories, setActiveSubcategories] = useState<string[]>([]);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking connection...');
  const { items, addItem, openCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get categories and subcategories 
  const categories = getCategories();
  // Create a mapping of categories to their subcategories
  const categorySubcategories = categories.reduce((acc, category) => {
    return { ...acc, [category]: getSubcategories(category) };
  }, {} as Record<string, string[]>);

  // Function to load all products
  const loadAllProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Loading all products from database...");
      const databaseProducts = await fetchProducts();
      console.log(`Fetched ${databaseProducts.length} products from database`);
      
      // Log category and subcategory information to help with debugging filter issues
      import('@/services/logService').then(({ logProductCategories }) => {
        logProductCategories(databaseProducts, "All Products");
      });
      
      setProducts(databaseProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle creating a test product
  const handleCreateTestProduct = async () => {
    setIsLoading(true);
    const result = await insertTestProduct();
    
    if (result.success) {
      setError(null);
      loadAllProducts(); // Reload products to show the new test product
    } else {
      setError(`Failed to create test product: ${result.message}`);
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setActiveCategory('All Products');
    setActiveSubcategories([]);
    setSearchQuery('');
    setShowSubcategories(false);
    
    // Reset to all products
    loadAllProducts();
  };
  
  // Test Supabase connection when component mounts
  useEffect(() => {
    const testConnection = async () => {
      // Test basic connection
      const connectionResult = await testSupabaseConnection();
      console.log('Supabase connection test:', connectionResult);
      
      if (!connectionResult.success) {
        setConnectionStatus(`Connection Error: ${connectionResult.message}`);
        setError(`Failed to connect to database: ${connectionResult.message}`);
        setIsLoading(false);
        return;
      }
      
      // Test products table access
      const productsResult = await testProductsAccess();
      console.log('Products access test:', productsResult);
      
      if (!productsResult.success) {
        setConnectionStatus(`Products Error: ${productsResult.message}`);
        setError(`Failed to access products table: ${productsResult.message}`);
        setIsLoading(false);
        return;
      }
      
      setConnectionStatus('Connection successful');
      // Continue with normal product loading
      loadAllProducts();
    };
    
    testConnection();
  }, []);
  
  // Update subcategories when category changes
  useEffect(() => {
    setActiveSubcategories([]);
    setShowSubcategories(activeCategory !== 'All Products');
  }, [activeCategory]);
  
  // Function to fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    setIsLoadingRecommendations(true);
    // Clear any existing recommendations first to avoid showing stale data
    setRecommendedProducts([]);
    
    try {
      if (selectedProduct) {
        // If a product is selected, show related products
        setRecommendedProducts(getRecommendedProducts(selectedProduct.id, selectedProduct.category, 3));
      } else if (user) {
        // If user is logged in and no product is selected, get recommendations from chat
        try {
          const chatRecommendations = await getRecommendationsFromChat(user.id, 3);
          setRecommendedProducts(chatRecommendations.length > 0 ? chatRecommendations : []);
        } catch (chatError) {
          console.error('Error fetching chat recommendations:', chatError);
          setRecommendedProducts([]);
        }
      } else {
        // If no user is logged in and no product is selected, show empty recommendations
        setRecommendedProducts([]);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendedProducts([]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [selectedProduct, user]);
  
  const filteredProducts = products.filter(product => {
    // Filter by category
    if (activeCategory !== 'All Products' && product.category !== activeCategory) {
      return false;
    }
    
    // Filter by subcategory if any are selected
    if (activeSubcategories.length > 0 && !activeSubcategories.includes(product.subcategory)) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  const handleAddToCart = (product: Product) => {
    addItem(product);
  };
  
  const cartItemForProduct = (productId: number) => {
    return items.find(item => item.id === productId);
  };
  
  const toggleSubcategory = (subcategory: string) => {
    setActiveSubcategories(prev => 
      prev.includes(subcategory)
        ? prev.filter(sc => sc !== subcategory)
        : [...prev, subcategory]
    );
  };
  
  // Add search functionality
  const handleSearch = async (searchTerm: string) => {
    if (searchTerm.trim() === '') {
      // If search is cleared, load all products
      loadAllProducts();
    } else {
      // Perform search
      setIsLoading(true);
      setError(null);
      try {
        console.log(`Searching for products with term: "${searchTerm}"`);
        const searchResults = await searchProducts(searchTerm);
        console.log(`Found ${searchResults.length} products matching "${searchTerm}"`);
        setProducts(searchResults);
      } catch (error) {
        console.error('Error searching products:', error);
        setError('Failed to search products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Use debounce for search to avoid too many API calls
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);
  
  // Handle category filter
  useEffect(() => {
    // Skip if this effect runs on mount
    if (isLoading) return;
    
    if (activeCategory !== 'All Products') {
      setIsLoading(true);
      setError(null);
      
      // Filter by category
      console.log(`Fetching products for category: ${activeCategory}`);
      getProductsByCategory(activeCategory)
        .then(categoryProducts => {
          console.log(`Found ${categoryProducts.length} products in category "${activeCategory}"`);
          setProducts(categoryProducts);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error filtering by category:', error);
          setError('Failed to filter by category. Please try again later.');
          setIsLoading(false);
        });
    } else if (!searchQuery) {
      // If no category filter or search, load all products
      loadAllProducts();
    }
  }, [activeCategory]);
  
  // Update recommended products when dependencies change
  useEffect(() => {
    fetchRecommendations();
    
    // Cleanup function to clear recommendations when component unmounts
    return () => {
      setRecommendedProducts([]);
    };
  }, [fetchRecommendations]);
  
  // Force refresh recommendations when component mounts
  useEffect(() => {
    // Clear any existing recommendations first
    setRecommendedProducts([]);
    
    // Small delay to ensure state is updated before fetching
    const timer = setTimeout(() => {
      fetchRecommendations();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Force clear recommendations when user changes
  useEffect(() => {
    setRecommendedProducts([]);
    
    // Small delay to ensure state is updated before fetching
    const timer = setTimeout(() => {
      fetchRecommendations();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [user]);
  
  
  return (
    <div className="h-screen flex flex-col bg-[#1E2735]">
      {/* Fixed header with search and filters */}
      <div className="border-b border-[#2A3143] p-4 sticky top-0 z-10 bg-[#1E2735]">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Shop Agricultural Products</h1>
          {connectionStatus && connectionStatus !== 'Connection successful' && (
            <div className="text-xs font-medium px-2 py-1 rounded bg-amber-600/20 text-amber-400">
              {connectionStatus}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 mt-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cropsay-grayText" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#10141E] border border-[#2A3143] rounded-lg py-2 pl-10 pr-4 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all"
            />
          </div>
          <button 
            className="action-button bg-[#10141E] hover:bg-[#2A3143]"
            onClick={() => navigate("/orders")}
          >
            <ShoppingBag size={18} />
            <span>Orders</span>
          </button>
          <button 
            onClick={openCart}
            className="relative p-2 bg-[#10141E] hover:bg-[#2A3143] rounded-lg transition-colors"
            aria-label={`View cart with ${items.length} items`}
          >
            <ShoppingCartIcon size={20} />
            <span className="absolute -top-1 -right-1 bg-cropsay-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {items.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar for filters and recommendations */}
        <div className="w-full md:w-64 p-4 border-r border-[#2A3143] md:h-[calc(100vh-88px)] overflow-y-auto sticky top-[88px] bg-[#1E2735]">
          {/* Filters */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold">Filters</h2>
              {(activeCategory !== 'All Products' || activeSubcategories.length > 0 || searchQuery) && (
                <button 
                  onClick={clearFilters}
                  className="text-xs text-cropsay-green hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Categories</h3>
              <div className="space-y-1">
                <button
                  key="all-products"
                  className={`block w-full text-left px-3 py-1.5 rounded text-sm ${
                    activeCategory === 'All Products' 
                      ? 'bg-cropsay-green text-white' 
                      : 'bg-[#10141E] hover:bg-[#2A3143]'
                  }`}
                  onClick={() => setActiveCategory('All Products')}
                >
                  All Products
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    className={`block w-full text-left px-3 py-1.5 rounded text-sm ${
                      activeCategory === category 
                        ? 'bg-cropsay-green text-white' 
                        : 'bg-[#10141E] hover:bg-[#2A3143]'
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            {showSubcategories && categorySubcategories[activeCategory] && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Subcategories</h3>
                <div className="space-y-1">
                  {categorySubcategories[activeCategory].map(subcategory => (
                    <div key={subcategory} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`subcategory-${subcategory}`}
                        checked={activeSubcategories.includes(subcategory)}
                        onChange={() => toggleSubcategory(subcategory)}
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-cropsay-green focus:ring-cropsay-green"
                      />
                      <label 
                        htmlFor={`subcategory-${subcategory}`}
                        className="text-sm cursor-pointer"
                      >
                        {subcategory}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Recommended Products */}
          <div>
            <h2 className="font-bold mb-2">Recommended Products</h2>
            {isLoadingRecommendations ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cropsay-green"></div>
              </div>
            ) : recommendedProducts.length > 0 ? (
              <div className="space-y-3">
                {recommendedProducts.map(product => (
                  <div 
                    key={`rec-${product.id}`} 
                    className="bg-[#10141E] rounded-lg p-2 cursor-pointer hover:bg-[#2A3143]"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-[#2A3143] rounded mr-2 flex-shrink-0 flex items-center justify-center text-xs text-cropsay-grayText">{product.category.charAt(0)}</div>
                      <div>
                        <h3 className="text-sm font-medium">{product.name}</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-400 text-xs mr-1">★</span>
                          <span className="text-xs">{product.rating}</span>
                          <span className="text-xs ml-2 text-cropsay-grayText">₹ {product.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                No recommendations available
              </div>
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-88px)]">
          {/* Active filters */}
          <div className="sticky top-0 bg-[#1E2735] z-10 p-4 pb-2">
            {(activeCategory !== 'All Products' || activeSubcategories.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeCategory !== 'All Products' && (
                  <div className="bg-cropsay-green bg-opacity-20 text-cropsay-green px-3 py-1 rounded-full text-sm flex items-center">
                    {activeCategory}
                    <button 
                      onClick={() => setActiveCategory('All Products')}
                      className="ml-2"
                   > 
                      <X size={14} />
                    </button>
                  </div>
                )}
              
  
                {activeSubcategories.map(subcategory => (
                  <div 
                    key={`filter-${subcategory}`}
                    className="bg-cropsay-green bg-opacity-20 text-cropsay-green px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {subcategory}
                    <button 
                      onClick={() => toggleSubcategory(subcategory)}
                      className="ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          
  
            {/* Products count */}
            <div className="mb-4">
              <p className="text-sm text-cropsay-grayText">
                Showing {filteredProducts.length} products
              </p>
            </div>
          </div>
          
          {/* Products grid - this is the only scrollable part */}
          <div className="p-4 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cropsay-green"></div>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-400">
                <h3 className="text-xl mb-2">Error</h3>
                <p>{error}</p>
                <div className="flex justify-center mt-4 space-x-4">
                  <button 
                    onClick={loadAllProducts}
                    className="px-4 py-2 bg-cropsay-green text-white rounded-md"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={handleCreateTestProduct}
                    className="px-4 py-2 bg-amber-600 text-white rounded-md"
                  >
                    Create Test Product
                  </button>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl mb-2">No Products Found</h3>
                <p className="text-cropsay-grayText">Try adjusting your filters or search.</p>
                <div className="flex justify-center mt-4 space-x-4">
                  <button 
                    onClick={clearFilters}
                    className="px-4 py-2 bg-cropsay-green text-white rounded-md"
                  >
                    Clear Filters
                  </button>
                  <button 
                    onClick={handleCreateTestProduct}
                    className="px-4 py-2 bg-amber-600 text-white rounded-md"
                  >
                    Create Test Product
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
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
