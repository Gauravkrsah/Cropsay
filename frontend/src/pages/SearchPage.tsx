import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, X, Clock, TrendingUp, ShoppingBag, Star, ShoppingCart } from 'lucide-react';
import { Product, products } from '@/data/productData';
import { searchProducts } from '@/services/productService';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/contexts/CartContext';

// Simple search suggestion interface
interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'category' | 'product';
  category?: string;
  icon?: React.ReactNode;
}

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { items, openCart } = useCart();

  // Calculate total items and price for bottom cart
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Handle initial search if query from URL
  useEffect(() => {
    const initialQuery = searchParams.get('q');
    console.log('Initial search query from URL:', initialQuery);
    
    if (initialQuery && initialQuery.trim()) {
      setSearchQuery(initialQuery);
      handleSearch(initialQuery);
    } else {
      // Don't load any products when no search query - show empty state
      setSearchResults([]);
      setShowSuggestions(true);
    }
  }, [searchParams]);



  // Generate suggestions based on search query
  const generateSuggestions = useCallback((query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    // First, add exact product name matches with highest priority
    const exactProductMatches = products.filter(product => 
      product.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 3);

    // Log for debugging
    console.log(`Found ${exactProductMatches.length} exact product matches for "${query}"`);
    if (exactProductMatches.length > 0) {
      console.log('Example product match:', exactProductMatches[0].name);
    }

    exactProductMatches.forEach(product => {
      suggestions.push({
        id: `product-${product.id}`,
        text: product.name,
        type: 'product',
        category: product.category,
        icon: <ShoppingBag size={16} />
      });
    });

    // Add common agricultural product terms that match the query
    if (suggestions.length < 5) {
      // Agricultural product terms (these are real products that should be in the database)
      const commonProducts = [
        { text: "Tomato Seeds", category: "Seeds" },
        { text: "Potato Seeds", category: "Seeds" },
        { text: "Onion Seeds", category: "Seeds" },
        { text: "Carrot Seeds", category: "Seeds" },
        { text: "Organic Fertilizer", category: "Fertilizers" },
        { text: "NPK Fertilizer", category: "Fertilizers" },
        { text: "Urea", category: "Fertilizers" },
        { text: "Insecticide", category: "Pesticides" },
        { text: "Fungicide", category: "Pesticides" },
        { text: "Garden Tools", category: "Tools & Equipment" },
        { text: "Drip Irrigation", category: "Irrigation" },
      ];
      
      // Filter for matching products and verify they exist in the product database
      const matchingCommonProducts = commonProducts
        .filter(item => item.text.toLowerCase().includes(lowerQuery))
        .filter(item => {
          // Only suggest products that actually exist in some form in our catalog
          return products.some(product => 
            product.name.toLowerCase().includes(item.text.toLowerCase()) ||
            product.category.toLowerCase() === item.category.toLowerCase()
          );
        })
        .slice(0, 3);
      
      console.log(`Found ${matchingCommonProducts.length} common product matches for "${query}"`);
      
      matchingCommonProducts.forEach((item, index) => {
        if (suggestions.length < 5) {
          suggestions.push({
            id: `common-${index}`,
            text: item.text,
            type: 'product',
            category: item.category,
            icon: <ShoppingBag size={16} />
          });
        }
      });
    }

    // Then add category matches
    if (suggestions.length < 5) {
      // Agricultural categories - only the ones that we actually have products for
      const categories = ['Seeds', 'Fertilizers', 'Pesticides', 'Tools & Equipment', 'Irrigation'];
      
      // Match categories that contain the search query
      const matchingCategories = categories.filter(category => 
        category.toLowerCase().includes(lowerQuery)
      );
      
      console.log(`Found ${matchingCategories.length} matching categories for "${query}"`);
      
      for (const category of matchingCategories) {
        if (suggestions.length < 5) {
          // Check if this category search would return results
          const categoryProducts = products.filter(product => 
            product.category.toLowerCase() === category.toLowerCase()
          );
          
          if (categoryProducts.length > 0) {
            suggestions.push({
              id: `cat-${category}`,
              text: category,
              type: 'category',
              category: category,
              icon: <ShoppingBag size={16} />
            });
          }
        }
      }
      
      // Add subcategory matches
      if (suggestions.length < 5) {
        // Find subcategories that match the query
        const matchingSubcategories = [...new Set(products
          .filter(product => product.subcategory.toLowerCase().includes(lowerQuery))
          .map(product => ({ subcategory: product.subcategory, category: product.category }))
        )];
        
        console.log(`Found ${matchingSubcategories.length} matching subcategories for "${query}"`);
        
        for (const item of matchingSubcategories) {
          if (suggestions.length < 5) {
            suggestions.push({
              id: `subcat-${item.subcategory}`,
              text: item.subcategory,
              type: 'category',
              category: item.category,
              icon: <ShoppingBag size={16} />
            });
          }
        }
      }
    }

    setSuggestions(suggestions.slice(0, 5));
    
    // Log for debugging
    console.log(`Generated ${suggestions.length} suggestions for "${query}"`);
  }, []);

  // Update suggestions when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      console.log('Generating suggestions for:', searchQuery);
      generateSuggestions(searchQuery);
      
      // If we're typing and have suggestions visible, get some immediate product matches to show
      if (showSuggestions) {
        const lowerQuery = searchQuery.toLowerCase();
        
        // Try to get more specific matches first
        const exactMatches = products.filter(product => 
          product.name.toLowerCase().includes(lowerQuery)
        );
        
        // If no exact matches, try broader matching
        const quickMatches = exactMatches.length > 0 ? exactMatches : products.filter(product => 
          product.name.toLowerCase().includes(lowerQuery) || 
          product.category.toLowerCase().includes(lowerQuery) ||
          product.subcategory.toLowerCase().includes(lowerQuery) ||
          product.description.toLowerCase().includes(lowerQuery)
        );
        
        // Limit results and ensure they're relevant
        const relevantMatches = quickMatches
          .slice(0, 10)
          // Sort by relevance - name matches first, then category
          .sort((a, b) => {
            // Name contains query - highest priority
            const aNameMatch = a.name.toLowerCase().includes(lowerQuery);
            const bNameMatch = b.name.toLowerCase().includes(lowerQuery);
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            
            // Category/subcategory matches - secondary priority
            const aCategoryMatch = a.category.toLowerCase().includes(lowerQuery) || 
                                  a.subcategory.toLowerCase().includes(lowerQuery);
            const bCategoryMatch = b.category.toLowerCase().includes(lowerQuery) || 
                                  b.subcategory.toLowerCase().includes(lowerQuery);
            if (aCategoryMatch && !bCategoryMatch) return -1;
            if (!aCategoryMatch && bCategoryMatch) return 1;
            
            return 0;
          });
          
        if (relevantMatches.length > 0) {
          console.log(`Found ${relevantMatches.length} relevant matches for "${searchQuery}"`);
          setSearchResults(relevantMatches);
        }
      }
    } else {
      setSuggestions([]);
      setSearchResults([]);
    }
  }, [searchQuery, generateSuggestions, showSuggestions]);

  // Handle search execution
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSuggestions(true);
      return;
    }

    setIsLoading(true);
    setShowSuggestions(false);

    try {
      // Update URL
      setSearchParams({ q: query });

      console.log(`Performing search for: "${query}"`);
      
      // First try to get results from database/supabase
      const supabaseResults = await searchProducts(query);
      console.log(`Supabase search returned ${supabaseResults.length} results for "${query}"`);
      
      if (supabaseResults.length > 0) {
        // Use Supabase results if available
        setSearchResults(supabaseResults);
      } else {
        // Fall back to local search if no Supabase results
        const lowerQuery = query.toLowerCase();
        
        // First check for exact name matches (highest relevance)
        let nameMatches = products.filter(product => 
          product.name.toLowerCase().includes(lowerQuery)
        );
        
        // Then check for category matches
        let categoryMatches = products.filter(product => 
          product.category.toLowerCase().includes(lowerQuery) ||
          product.subcategory.toLowerCase().includes(lowerQuery)
        );
        
        // Then description and brand matches
        let otherMatches = products.filter(product => 
          (product.description.toLowerCase().includes(lowerQuery) || 
          product.brand.toLowerCase().includes(lowerQuery)) &&
          !nameMatches.some(p => p.id === product.id) &&
          !categoryMatches.some(p => p.id === product.id)
        );
        
        // Combine results, prioritizing exact matches
        const combinedResults = [
          ...nameMatches,
          ...categoryMatches.filter(product => !nameMatches.some(p => p.id === product.id)),
          ...otherMatches
        ];
        
        console.log(`Local search: "${query}" - Found ${combinedResults.length} products`, {
          nameMatches: nameMatches.length,
          categoryMatches: categoryMatches.length,
          otherMatches: otherMatches.length
        });
        
        setSearchResults(combinedResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fall back to basic search on error
      const lowerQuery = query.toLowerCase();
      const fallbackResults = products.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
      );
      console.log(`Search error fallback: Found ${fallbackResults.length} products for "${query}"`);
      setSearchResults(fallbackResults);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    console.log('Suggestion clicked:', suggestion);
    setSearchQuery(suggestion.text);
    
    // If it's a category suggestion, search with that as the category
    if (suggestion.type === 'category' && suggestion.category) {
      console.log(`Searching for category: ${suggestion.text}`);
      handleSearch(suggestion.text);
    } else {
      // For product suggestions, search with the product name
      console.log(`Searching for product: ${suggestion.text}`);
      handleSearch(suggestion.text);
    }
  };

  // Handle search form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with query:', searchQuery);
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(true);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    setSearchParams({});
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#1E2735]">
      {/* Header with Search */}
      <div className="sticky top-0 z-50 bg-[#10141E] border-b border-[#2A3143]">
        <div className="flex items-center gap-3 p-4">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-[#2A3143] transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search for seeds, fertilizers and more"
                className="w-full bg-[#1E2735] border border-[#2A3143] rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/25 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-[#2A3143] transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className={`p-4 ${totalItems > 0 ? 'pb-24' : ''}`}>
        {/* Search Suggestions - Show when typing */}
        {showSuggestions && searchQuery.trim() !== '' && suggestions.length > 0 && !isLoading && (
          <div className="bg-[#10141E] rounded-lg border border-[#2A3143] mb-4">
            <div className="p-3 border-b border-[#2A3143]">
              <h3 className="text-sm font-medium text-gray-300">Suggestions</h3>
            </div>
            <div className="space-y-1 p-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-[#2A3143] transition-colors text-left group"
                >
                  <div className={`transition-colors ${
                    suggestion.type === 'product' ? 'text-green-400 group-hover:text-green-300' :
                    suggestion.type === 'category' ? 'text-blue-400 group-hover:text-blue-300' :
                    'text-gray-400 group-hover:text-white'
                  }`}>
                    {suggestion.icon}
                  </div>
                  <div className="flex-1">
                    <span className="text-white text-sm">{suggestion.text}</span>
                    {suggestion.category && suggestion.type !== 'category' && (
                      <span className="text-xs text-gray-400 ml-1">in {suggestion.category}</span>
                    )}
                  </div>
                  {suggestion.type === 'category' && (
                    <div className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                      Category
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        )}

        {/* Products Display - Always show when we have results, regardless of suggestions state */}
        {!isLoading && searchQuery.trim() !== '' && searchResults.length > 0 && (
          <div>
            <div className="mb-4">
              <h2 className="text-sm text-gray-400 mb-2">
                {showSuggestions ? 'Matching products' : `Showing results for "${searchQuery}"`}
              </h2>
              <p className="text-xs text-gray-500">{searchResults.length} agricultural products found</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {searchResults.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => navigate(`/shop/product/${product.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && searchQuery.trim() !== '' && searchResults.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#2A3143] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
            <p className="text-gray-400 mb-4">
              We couldn't find any products matching "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSuggestions(true);
                setSearchResults([]);
              }}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              Clear search and try again
            </button>
          </div>
        )}

        {/* Empty State - When no search query and no products loaded */}
        {!isLoading && searchQuery.trim() === '' && searchResults.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#2A3143] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Search for agricultural products</h3>
            <p className="text-gray-400">
              Try searching for seeds, fertilizers, tools, pesticides, or irrigation equipment
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button 
                onClick={() => {setSearchQuery('seeds'); handleSearch('seeds');}}
                className="px-3 py-1 bg-[#2A3143] hover:bg-[#363E50] text-green-400 rounded-full text-sm transition-colors"
              >
                Seeds
              </button>
              <button 
                onClick={() => {setSearchQuery('fertilizer'); handleSearch('fertilizer');}}
                className="px-3 py-1 bg-[#2A3143] hover:bg-[#363E50] text-green-400 rounded-full text-sm transition-colors"
              >
                Fertilizers
              </button>
              <button 
                onClick={() => {setSearchQuery('pesticide'); handleSearch('pesticide');}}
                className="px-3 py-1 bg-[#2A3143] hover:bg-[#363E50] text-green-400 rounded-full text-sm transition-colors"
              >
                Pesticides
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Cart Bar - Show when items in cart */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-500 p-4 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <ShoppingCart size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {totalItems} item{totalItems > 1 ? 's' : ''}
                </p>
                <p className="text-white text-sm opacity-90">
                  ₹{totalPrice.toFixed(0)}
                </p>
              </div>
            </div>
            <button
              onClick={openCart}
              className="bg-white text-green-500 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Cart →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
