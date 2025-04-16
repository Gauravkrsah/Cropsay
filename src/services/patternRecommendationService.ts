import { Product, products } from '@/data/productData';

/**
 * Pattern-based Recommendation Service
 * Provides product recommendations based on specific query patterns
 */

/**
 * Get product recommendations based on specific query patterns
 * @param chatText - The text from user's chat
 * @param limit - Maximum number of products to return
 * @returns Array of recommended products or null if no specific pattern matched
 */
export const getPatternBasedRecommendations = (chatText: string, limit: number = 3): Product[] | null => {
  const lowerText = chatText.toLowerCase();
  
  // Check for herbicide + rice pattern
  if ((lowerText.includes('herbicide') || lowerText.includes('weed') || lowerText.includes('weeds')) && 
      (lowerText.includes('rice') || lowerText.includes('paddy'))) {
    console.log('Detected herbicide for rice pattern');
    
    // Filter products that are herbicides
    const herbicideProducts = products.filter(product => {
      const productText = `${product.name} ${product.description} ${product.category} ${product.subcategory}`.toLowerCase();
      return (product.category === 'Pesticides' || 
              productText.includes('herbicide') || 
              productText.includes('weed') || 
              productText.includes('weedicide')) &&
             !productText.includes('seed');
    });
    
    if (herbicideProducts.length > 0) {
      console.log(`Found ${herbicideProducts.length} herbicide products`);
      return herbicideProducts
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    }
  }
  
  // Check for fertilizer pattern
  if (lowerText.includes('fertilizer') || lowerText.includes('nutrient')) {
    console.log('Detected fertilizer pattern');
    
    // Filter products that are fertilizers
    const fertilizerProducts = products.filter(product => 
      product.category === 'Fertilizers'
    );
    
    if (fertilizerProducts.length > 0) {
      return fertilizerProducts.sort((a, b) => b.rating - a.rating).slice(0, limit);
    }
  }
  
  // Check for seed pattern
  if (lowerText.includes('seed') || lowerText.includes('seeds') || lowerText.includes('planting')) {
    console.log('Detected seed pattern');
    
    // Filter products that are seeds
    const seedProducts = products.filter(product => 
      product.category === 'Seeds'
    );
    
    if (seedProducts.length > 0) {
      return seedProducts.sort((a, b) => b.rating - a.rating).slice(0, limit);
    }
  }
  
  // Check for specific crop patterns
  const cropPatterns = [
    { crop: 'tomato', keywords: ['tomato', 'tomatoes'] },
    { crop: 'rice', keywords: ['rice', 'paddy'] },
    { crop: 'wheat', keywords: ['wheat'] },
    { crop: 'garlic', keywords: ['garlic'] },
    { crop: 'potato', keywords: ['potato', 'potatoes'] }
  ];
  
  for (const pattern of cropPatterns) {
    if (pattern.keywords.some(keyword => lowerText.includes(keyword))) {
      console.log(`Detected ${pattern.crop} pattern`);
      
      // First try to find products specifically for this crop
      const specificProducts = products.filter(product => {
        const productText = `${product.name} ${product.description} ${product.category} ${product.subcategory}`.toLowerCase();
        return pattern.keywords.some(keyword => productText.includes(keyword));
      });
      
      if (specificProducts.length > 0) {
        return specificProducts.sort((a, b) => b.rating - a.rating).slice(0, limit);
      }
    }
  }
  
  return null;
};