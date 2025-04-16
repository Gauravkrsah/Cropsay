/**
 * NLP Bridge Service
 * Connects the frontend with the Python NLP service
 */

import { Product, products } from '@/data/productData';
import { chatService } from './chatService';

// URL of the NLP service
const NLP_SERVICE_URL = 'http://localhost:3001';

// Interface for NLP service recommendation response
interface NLPRecommendation {
  id: number;
  name: string;
  score: number;
  reasoning: string;
}

interface NLPResponse {
  recommendations: NLPRecommendation[];
  query_embedding: number[];
  intent_analysis: {
    intent: string;
    keywords: Record<string, string[]>;
    chat_context: Record<string, any>;
  };
}

/**
 * Check if the NLP service is running
 * @returns Promise resolving to boolean indicating if service is available
 */
export const checkNLPServiceAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${NLP_SERVICE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('NLP service is not available:', error);
    return false;
  }
};

/**
 * Get recommendations from the NLP service
 * @param query - The query to get recommendations for
 * @param chatHistory - Optional chat history for context
 * @param limit - Maximum number of recommendations to return
 * @returns Promise resolving to array of products
 */
export const getNLPRecommendations = async (
  query: string,
  chatHistory?: { role: string; content: string }[],
  limit: number = 10  // Increased default limit to show more recommendations
): Promise<Product[]> => {
  try {
    // Check if NLP service is available
    const isAvailable = await checkNLPServiceAvailability();
    
    if (!isAvailable) {
      console.log('NLP service is not available, falling back to default recommendations');
      return getDefaultRecommendations(limit);
    }
    
    // Ensure we have a valid query
    if (!query || query.trim() === '') {
      console.log('Empty query provided, falling back to default recommendations');
      return getDefaultRecommendations(limit);
    }
    
    // Prepare request body
    const requestBody = {
      query,
      chat_history: chatHistory,
      limit
    };
    
    // Send request to NLP service
    const response = await fetch(`${NLP_SERVICE_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`NLP service returned status ${response.status}`);
    }
    
    // Parse response
    const data: NLPResponse = await response.json();
    
    // Log intent analysis for debugging
    console.log('NLP intent analysis:', data.intent_analysis);
    
    // Map NLP recommendations to products
    const recommendedProducts: Product[] = [];
    
    for (const rec of data.recommendations) {
      // Find product by ID
      const product = products.find(p => p.id === rec.id);
      
      if (product && !recommendedProducts.some(p => p.id === product.id)) {
        recommendedProducts.push(product);
        
        if (recommendedProducts.length >= limit) {
          break;
        }
      }
    }
    
    // If we couldn't find enough products, add some default ones
    if (recommendedProducts.length < limit) {
      const defaultRecs = getDefaultRecommendations(limit - recommendedProducts.length);
      
      // Add default recommendations that aren't already in the list
      for (const product of defaultRecs) {
        if (!recommendedProducts.some(p => p.id === product.id)) {
          recommendedProducts.push(product);
          
          if (recommendedProducts.length >= limit) {
            break;
          }
        }
      }
    }
    
    return recommendedProducts;
  } catch (error) {
    console.error('Error getting recommendations from NLP service:', error);
    return getDefaultRecommendations(limit);
  }
};

/**
 * Get recommendations from the NLP service based on chat history
 * @param userId - The user ID to get chat history for
 * @param limit - Maximum number of recommendations to return
 * @returns Promise resolving to array of products
 */
export const getNLPRecommendationsFromChat = async (
  userId: string,
  limit: number = 3
): Promise<Product[]> => {
  try {
    // Get user's chat sessions
    const chatSessions = await chatService.getChatSessions(userId);

    if (!chatSessions || chatSessions.length === 0) {
      console.log('No chat sessions found for user:', userId);
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
      return getDefaultRecommendations(limit);
    }
    
    // Extract all user messages from the chat history
    const userMessages = recentSession.messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);
      
    if (userMessages.length === 0) {
      console.log('No user messages found in recent chat session');
      return getDefaultRecommendations(limit);
    }
    
    // Use the last 3 user messages for better context
    const queryText = userMessages.slice(-3).join(' ');
    console.log('Using query text from chat history:', queryText);
    
    // Convert messages to format for NLP service
    const formattedChatHistory = recentSession.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Get recommendations using the combined user messages and chat history
    return getNLPRecommendations(queryText, formattedChatHistory, limit);
  } catch (error) {
    console.error('Error getting NLP recommendations from chat:', error);
    return getDefaultRecommendations(limit);
  }
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