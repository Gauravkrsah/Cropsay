// Search suggestions and categories data structure
export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'category' | 'product' | 'popular';
  category?: string;
  subcategory?: string;
  searchVolume?: number;
  seasonal?: boolean;
}

export interface SearchCategory {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  subcategories: string[];
  popularItems: string[];
  keywords: string[];
}

// Popular agricultural search categories
export const searchCategories: SearchCategory[] = [
  {
    id: 'seeds',
    name: 'Seeds',
    displayName: 'Seeds & Seedlings',
    icon: '🌱',
    subcategories: ['Vegetable Seeds', 'Flower Seeds', 'Herb Seeds', 'Field Crop Seeds'],
    popularItems: ['Tomato seeds', 'Chili seeds', 'Cucumber seeds', 'Wheat seeds', 'Rice seeds'],
    keywords: ['seed', 'seeds', 'seedling', 'germination', 'planting']
  },
  {
    id: 'fertilizers',
    name: 'Fertilizers',
    displayName: 'Fertilizers & Nutrients',
    icon: '🧪',
    subcategories: ['Organic Fertilizers', 'Synthetic Fertilizers', 'Liquid Fertilizers', 'Biofertilizers'],
    popularItems: ['NPK fertilizer', 'Urea', 'Compost', 'Bone meal', 'Organic fertilizer'],
    keywords: ['fertilizer', 'nutrients', 'NPK', 'organic', 'compost', 'manure']
  },
  {
    id: 'pesticides',
    name: 'Pesticides',
    displayName: 'Pest & Disease Control',
    icon: '🐛',
    subcategories: ['Insecticides', 'Fungicides', 'Herbicides', 'Organic Pesticides'],
    popularItems: ['Neem oil', 'Fungicide spray', 'Weed killer', 'Insect spray', 'Organic pesticide'],
    keywords: ['pesticide', 'insecticide', 'fungicide', 'herbicide', 'pest control', 'disease control']
  },
  {
    id: 'tools',
    name: 'Tools & Equipment',
    displayName: 'Farming Tools',
    icon: '🔧',
    subcategories: ['Hand Tools', 'Power Tools', 'Harvesting Tools', 'Sprayers'],
    popularItems: ['Garden hoe', 'Sprayer', 'Pruning shears', 'Watering can', 'Tractor attachments'],
    keywords: ['tools', 'equipment', 'sprayer', 'hoe', 'shovel', 'pruning', 'harvest']
  },
  {
    id: 'irrigation',
    name: 'Irrigation',
    displayName: 'Irrigation Systems',
    icon: '💧',
    subcategories: ['Drip Irrigation', 'Sprinkler Systems', 'Pipes & Fittings', 'Water Pumps'],
    popularItems: ['Drip irrigation kit', 'Sprinkler system', 'Water pump', 'Garden hose', 'Irrigation timer'],
    keywords: ['irrigation', 'watering', 'drip', 'sprinkler', 'pump', 'water']
  }
];

// Trending search terms based on seasons and agricultural cycles
export const trendingSearches: SearchSuggestion[] = [
  {
    id: 'trend-1',
    text: 'Tomato seeds',
    type: 'trending',
    category: 'Seeds',
    searchVolume: 1250,
    seasonal: true
  },
  {
    id: 'trend-2',
    text: 'Organic fertilizer',
    type: 'trending',
    category: 'Fertilizers',
    searchVolume: 980
  },
  {
    id: 'trend-3',
    text: 'Fungicide spray',
    type: 'trending',
    category: 'Pesticides',
    searchVolume: 820
  },
  {
    id: 'trend-4',
    text: 'Drip irrigation kit',
    type: 'trending',
    category: 'Irrigation',
    searchVolume: 760
  },
  {
    id: 'trend-5',
    text: 'Garden sprayer',
    type: 'trending',
    category: 'Tools & Equipment',
    searchVolume: 650
  },
  {
    id: 'trend-6',
    text: 'Chili seeds',
    type: 'trending',
    category: 'Seeds',
    searchVolume: 580
  },
  {
    id: 'trend-7',
    text: 'NPK fertilizer',
    type: 'trending',
    category: 'Fertilizers',
    searchVolume: 520
  }
];

// Popular searches that are consistently high-volume
export const popularSearches: SearchSuggestion[] = [
  {
    id: 'pop-1',
    text: 'Seeds',
    type: 'popular',
    category: 'Seeds',
    searchVolume: 2100
  },
  {
    id: 'pop-2',
    text: 'Vegetable seeds',
    type: 'popular',
    category: 'Seeds',
    searchVolume: 1800
  },
  {
    id: 'pop-3',
    text: 'Tomato seeds',
    type: 'popular',
    category: 'Seeds',
    subcategory: 'Vegetable Seeds',
    searchVolume: 950
  },
  {
    id: 'pop-4',
    text: 'Chili seeds',
    type: 'popular',
    category: 'Seeds',
    subcategory: 'Vegetable Seeds',
    searchVolume: 720
  },
  {
    id: 'pop-5',
    text: 'Cucumber seeds',
    type: 'popular',
    category: 'Seeds',
    subcategory: 'Vegetable Seeds',
    searchVolume: 680
  },
  {
    id: 'pop-6',
    text: 'Fertilizers',
    type: 'popular',
    category: 'Fertilizers',
    searchVolume: 1650
  },
  {
    id: 'pop-7',
    text: 'Organic fertilizer',
    type: 'popular',
    category: 'Fertilizers',
    searchVolume: 1400
  },
  {
    id: 'pop-8',
    text: 'NPK fertilizer',
    type: 'popular',
    category: 'Fertilizers',
    searchVolume: 1200
  },
  {
    id: 'pop-9',
    text: 'Pesticides',
    type: 'popular',
    category: 'Pesticides',
    searchVolume: 1200
  },
  {
    id: 'pop-10',
    text: 'Irrigation tools',
    type: 'popular',
    category: 'Irrigation',
    searchVolume: 890
  },
  {
    id: 'pop-11',
    text: 'Garden tools',
    type: 'popular',
    category: 'Tools & Equipment',
    searchVolume: 1100
  },
  {
    id: 'pop-12',
    text: 'Sprayer',
    type: 'popular',
    category: 'Tools & Equipment',
    searchVolume: 980
  }
];

// Season-specific suggestions
export const getSeasonalSuggestions = (): SearchSuggestion[] => {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  // Monsoon season (June-September)
  if (currentMonth >= 6 && currentMonth <= 9) {
    return [
      {
        id: 'seasonal-monsoon-1',
        text: 'Rice seeds',
        type: 'trending',
        category: 'Seeds',
        seasonal: true
      },
      {
        id: 'seasonal-monsoon-2',
        text: 'Fungicide spray',
        type: 'trending',
        category: 'Pesticides',
        seasonal: true
      },
      {
        id: 'seasonal-monsoon-3',
        text: 'Drainage tools',
        type: 'trending',
        category: 'Tools & Equipment',
        seasonal: true
      }
    ];
  }
  
  // Winter season (November-February)
  if (currentMonth >= 11 || currentMonth <= 2) {
    return [
      {
        id: 'seasonal-winter-1',
        text: 'Wheat seeds',
        type: 'trending',
        category: 'Seeds',
        seasonal: true
      },
      {
        id: 'seasonal-winter-2',
        text: 'Winter vegetables',
        type: 'trending',
        category: 'Seeds',
        seasonal: true
      },
      {
        id: 'seasonal-winter-3',
        text: 'Cold protection',
        type: 'trending',
        category: 'Tools & Equipment',
        seasonal: true
      }
    ];
  }
  
  // Summer season (March-May)
  return [
    {
      id: 'seasonal-summer-1',
      text: 'Irrigation systems',
      type: 'trending',
      category: 'Irrigation',
      seasonal: true
    },
    {
      id: 'seasonal-summer-2',
      text: 'Water-saving tools',
      type: 'trending',
      category: 'Irrigation',
      seasonal: true
    },
    {
      id: 'seasonal-summer-3',
      text: 'Summer vegetables',
      type: 'trending',
      category: 'Seeds',
      seasonal: true
    }
  ];
};

// Helper function to get search suggestions based on query
export const getSearchSuggestions = (query: string): SearchSuggestion[] => {
  if (!query.trim()) {
    // Return popular and seasonal suggestions when no query
    const seasonal = getSeasonalSuggestions();
    const popular = popularSearches.slice(0, 6);
    const trending = trendingSearches.slice(0, 4);
    
    return [...seasonal, ...popular, ...trending].slice(0, 10);
  }
  
  const lowerQuery = query.toLowerCase();
  const suggestions: SearchSuggestion[] = [];
  
  // Match against popular searches
  popularSearches.forEach(suggestion => {
    if (suggestion.text.toLowerCase().includes(lowerQuery)) {
      suggestions.push(suggestion);
    }
  });
  
  // Match against trending searches
  trendingSearches.forEach(suggestion => {
    if (suggestion.text.toLowerCase().includes(lowerQuery)) {
      suggestions.push(suggestion);
    }
  });
  
  // Match against categories
  searchCategories.forEach(category => {
    if (category.name.toLowerCase().includes(lowerQuery) || 
        category.displayName.toLowerCase().includes(lowerQuery) ||
        category.keywords.some(keyword => keyword.includes(lowerQuery))) {
      suggestions.push({
        id: `cat-${category.id}`,
        text: category.displayName,
        type: 'category',
        category: category.name
      });
      
      // Add popular items from this category
      category.popularItems.forEach((item, index) => {
        if (item.toLowerCase().includes(lowerQuery)) {
          suggestions.push({
            id: `cat-item-${category.id}-${index}`,
            text: item,
            type: 'product',
            category: category.name
          });
        }
      });
    }
  });
  
  return suggestions.slice(0, 8);
};

// Function to track search analytics (for future implementation)
export const trackSearch = (query: string, resultCount: number) => {
  // This would typically send analytics data to your backend
  console.log(`Search tracked: "${query}" - ${resultCount} results`);
};

// Export all data for use in components
export {
  searchCategories as categories,
  trendingSearches as trending,
  popularSearches as popular
};
