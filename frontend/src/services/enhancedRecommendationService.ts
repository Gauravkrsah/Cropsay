import { Product, products } from '@/data/productData';
import { chatService } from './chatService';
import { agriculturalKnowledgeGraph } from '@/data/agriculturalKnowledgeGraph';
import { getPatternBasedRecommendations } from './patternRecommendationService';

/**
 * Enhanced Recommendation Service
 * Uses advanced NLP and KNN algorithms to provide better product recommendations
 */

/**
 * Extract main topics from text
 * @param text - The text to extract topics from
 * @returns Array of main topics
 */
const extractMainTopics = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  const topics: string[] = [];
  
  // Check for specific crops
  const cropKeywords = [
    'tomato', 'tomatoes', 'wheat', 'rice', 'corn', 'maize', 'potato', 'potatoes',
    'garlic', 'onion', 'carrot', 'bean', 'pea', 'cucumber', 'lettuce', 'cabbage'
  ];
  
  cropKeywords.forEach(crop => {
    if (lowerText.includes(crop)) {
      topics.push(crop);
    }
  });
  
  // Check for farming activities
  const activityKeywords = [
    'grow', 'growing', 'plant', 'planting', 'harvest', 'harvesting',
    'fertilize', 'fertilizing', 'water', 'watering', 'spray', 'spraying'
  ];
  
  activityKeywords.forEach(activity => {
    if (lowerText.includes(activity)) {
      topics.push(activity);
    }
  });
  
  // Return unique topics
  return [...new Set(topics)];
};

/**
 * Calculate Euclidean distance between two vectors
 * @param vector1 - First vector
 * @param vector2 - Second vector
 * @returns Euclidean distance
 */
const euclideanDistance = (vector1: number[], vector2: number[]): number => {
  if (vector1.length !== vector2.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let sum = 0;
  for (let i = 0; i < vector1.length; i++) {
    sum += Math.pow(vector1[i] - vector2[i], 2);
  }
  
  return Math.sqrt(sum);
};

/**
 * Extract enhanced feature vector from text with more dimensions
 * @param text - The text to extract features from
 * @returns Enhanced feature vector
 */
const extractEnhancedFeaturesFromText = (text: string): number[] => {
  const lowerText = text.toLowerCase();
  const mainTopics = extractMainTopics(lowerText);
  
  // Log main topics for debugging
  console.log('Main topics extracted:', mainTopics);
  
  // Create a more detailed feature vector with specific crop and activity detection
  return [
    // Crops
    lowerText.includes('tomato') || lowerText.includes('tomatoes') ? 1 : 0,
    lowerText.includes('wheat') ? 1 : 0,
    lowerText.includes('rice') ? 1 : 0,
    lowerText.includes('garlic') ? 1 : 0,
    lowerText.includes('potato') || lowerText.includes('potatoes') ? 1 : 0,
    
    // Activities
    lowerText.includes('grow') || lowerText.includes('growing') ? 1 : 0,
    lowerText.includes('plant') || lowerText.includes('planting') ? 1 : 0,
    lowerText.includes('fertilize') || lowerText.includes('fertilizer') || lowerText.includes('fertilizing') ? 1 : 0,
    lowerText.includes('water') || lowerText.includes('watering') || lowerText.includes('irrigation') ? 1 : 0,
    
    // Problems
    lowerText.includes('disease') || lowerText.includes('diseases') ? 1 : 0,
    lowerText.includes('pest') || lowerText.includes('pests') || lowerText.includes('insect') ? 1 : 0,
    lowerText.includes('weed') || lowerText.includes('weeds') ? 1 : 0,
    
    // General categories
    lowerText.includes('seed') || lowerText.includes('seeds') ? 1 : 0,
    lowerText.includes('organic') || lowerText.includes('natural') ? 1 : 0
  ];
};

/**
 * Extract enhanced feature vector from product with more dimensions
 * @param product - The product to extract features from
 * @returns Enhanced feature vector
 */
const extractEnhancedFeaturesFromProduct = (product: Product): number[] => {
  const productText = `${product.name} ${product.description} ${product.category} ${product.subcategory}`.toLowerCase();
  
  // Create a more detailed feature vector matching the dimensions in extractEnhancedFeaturesFromText
  return [
    // Crops
    productText.includes('tomato') ? 1 : 0,
    productText.includes('wheat') ? 1 : 0,
    productText.includes('rice') ? 1 : 0,
    productText.includes('garlic') ? 1 : 0,
    productText.includes('potato') ? 1 : 0,
    
    // Activities
    productText.includes('grow') ? 1 : 0,
    productText.includes('plant') ? 1 : 0,
    productText.includes('fertilize') || productText.includes('fertilizer') ? 1 : 0,
    productText.includes('water') || productText.includes('irrigation') ? 1 : 0,
    
    // Problems
    productText.includes('disease') ? 1 : 0,
    productText.includes('pest') || productText.includes('insect') ? 1 : 0,
    productText.includes('weed') ? 1 : 0,
    
    // General categories
    productText.includes('seed') ? 1 : 0,
    productText.includes('organic') || productText.includes('natural') ? 1 : 0
  ];
};

/**
 * Get product recommendations using enhanced KNN algorithm
 * @param chatText - The text from user's chat
 * @param limit - Maximum number of products to return
 * @returns Array of recommended products
 */
export const getEnhancedRecommendations = (chatText: string, limit: number = 3): Product[] => {
  console.log('Using enhanced recommendations for text:', chatText);
  
  // Extract main topics for better context
  const mainTopics = extractMainTopics(chatText);
  console.log('Main topics extracted:', mainTopics);
  
  // Try pattern-based recommendations first
  const patternRecommendations = getPatternBasedRecommendations(chatText, limit);
  
  if (patternRecommendations) {
    console.log('Using pattern-based recommendations');
    return patternRecommendations;
  }
  
  if (mainTopics.length === 0) {
    console.log('No specific topics found, returning default recommendations');
    return getDefaultRecommendations(limit);
  }
  
  // Extract features from chat text
  const chatFeatures = extractEnhancedFeaturesFromText(chatText);
  
  // Calculate distances between chat features and product features
  const productDistances = products.map(product => {
    const productFeatures = extractEnhancedFeaturesFromProduct(product);
    const distance = euclideanDistance(chatFeatures, productFeatures);
    return { product, distance };
  });
  
  // Log top matches for debugging
  console.log('Top enhanced matches:', productDistances.sort((a, b) => a.distance - b.distance).slice(0, 3).map(p => `${p.product.name}: ${p.distance}`));
  
  // Sort by distance (ascending) and take top N
  return productDistances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(item => item.product);
};

/**
 * Get default recommendations (top-rated products)
 * @param limit - Maximum number of products to return
 * @returns Array of top-rated products
 */
export const getDefaultRecommendations = (limit: number = 3): Product[] => {
  console.log('Getting default recommendations');
  return [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

/**
 * Get recommended products based on user's recent chat messages
 * @param userId - The user ID
 * @param limit - Maximum number of products to return (default: 3)
 * @returns Promise resolving to an array of recommended products
 */
export const getRecommendationsFromChat = async (
  userId: string,
  limit: number = 3
): Promise<Product[]> => {
  try {
    // Get user's chat sessions
    const chatSessions = await chatService.getChatSessions(userId);

    if (!chatSessions || chatSessions.length === 0) {
      console.log('No chat sessions found for user:', userId);
      // Return default recommendations instead of empty array
      return getDefaultRecommendations(limit);
    }
    
    // Sort sessions by timestamp (newest first)
    const sortedSessions = [...chatSessions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Get the most recent session
    const recentSession = sortedSessions[0];
    
    if (!recentSession || !recentSession.messages || recentSession.messages.length === 0) {
      console.log('No messages found in recent chat session');
      // Return default recommendations
      return getDefaultRecommendations(limit);
    }
    
    // Extract text from all messages in the recent session
    const chatText = recentSession.messages
      .map(msg => msg.content)
      .join(' ');
    
    console.log('Analyzing chat text:', chatText);
    
    // Use enhanced recommendations
    return getEnhancedRecommendations(chatText, limit);
    
  } catch (error) {
    console.error('Error getting recommendations from chat:', error);
    return getDefaultRecommendations(limit);
  }
};