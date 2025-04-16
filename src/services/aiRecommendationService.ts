/**
 * AI-based Recommendation Service
 * Uses Gemini, transformers, NLP, and intent understanding to provide intelligent product recommendations
 * based on user chat history and context
 */

import { Product, products } from '@/data/productData';
import { chatService } from './chatService';
import { agriculturalKnowledgeGraph } from '@/data/agriculturalKnowledgeGraph';
import { GoogleGenerativeAI } from '@google/generative-ai';

// API key
const GEMINI_API_KEY = '***REMOVED***';

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Use Gemini 1.5 Flash model
const MODEL_NAME = 'gemini-1.5-flash';

// Interface for intent analysis result
interface IntentAnalysis {
  primaryIntent: string;
  secondaryIntents: string[];
  entities: {
    crops: string[];
    problems: string[];
    activities: string[];
    products: string[];
  };
  sentiment: number; // -1 to 1 scale
  urgency: number; // 0 to 1 scale
  stage: string; // e.g., "research", "ready-to-buy", "problem-solving"
}

// Interface for embedding vector
interface EmbeddingVector {
  values: number[];
}

// Interface for product recommendation with reasoning
interface RecommendationWithReasoning {
  product: Product;
  score: number;
  reasoning: string;
}

/**
 * Extract entities from text using the agricultural knowledge graph
 * @param text - The text to extract entities from
 * @returns Object with extracted entities by type
 */
const extractEntitiesFromText = (text: string): IntentAnalysis['entities'] => {
  const lowerText = text.toLowerCase();
  const entities = {
    crops: [] as string[],
    problems: [] as string[],
    activities: [] as string[],
    products: [] as string[]
  };
  
  // Extract crops
  agriculturalKnowledgeGraph.crops.forEach(crop => {
    if (lowerText.includes(crop.name.toLowerCase())) {
      entities.crops.push(crop.name);
    }
  });
  
  // Extract problems
  agriculturalKnowledgeGraph.problems.forEach(problem => {
    if (lowerText.includes(problem.name.toLowerCase())) {
      entities.problems.push(problem.name);
    }
  });
  
  // Extract activities
  agriculturalKnowledgeGraph.activities.forEach(activity => {
    if (lowerText.includes(activity.name.toLowerCase())) {
      entities.activities.push(activity.name);
    }
  });
  
  // Extract product types from text
  const productKeywords = [
    { keyword: 'seed', category: 'Seeds' },
    { keyword: 'fertilizer', category: 'Fertilizers' },
    { keyword: 'spray', category: 'Tools & Equipment' },
    { keyword: 'sprayer', category: 'Tools & Equipment' },
    { keyword: 'watering', category: 'Tools & Equipment' },
    { keyword: 'pesticide', category: 'Pesticides' },
    { keyword: 'insecticide', category: 'Pesticides' },
    { keyword: 'fungicide', category: 'Pesticides' },
    { keyword: 'herbicide', category: 'Pesticides' },
    { keyword: 'tool', category: 'Tools & Equipment' },
    { keyword: 'equipment', category: 'Tools & Equipment' },
    { keyword: 'irrigation', category: 'Irrigation' },
    { keyword: 'sprinkler', category: 'Irrigation' },
    { keyword: 'drip', category: 'Irrigation' },
    { keyword: 'water', category: 'Tools & Equipment' },
    { keyword: 'mist', category: 'Tools & Equipment' }
  ];
  
  productKeywords.forEach(({ keyword, category }) => {
    if (lowerText.includes(keyword)) {
      entities.products.push(category);
    }
  });
  
  // Remove duplicates
  entities.crops = [...new Set(entities.crops)];
  entities.problems = [...new Set(entities.problems)];
  entities.activities = [...new Set(entities.activities)];
  entities.products = [...new Set(entities.products)];
  
  return entities;
};

/**
 * Analyze user intent from chat text using NLP techniques
 * @param chatText - The text from user's chat
 * @returns Intent analysis result
 */
const analyzeIntent = (chatText: string): IntentAnalysis => {
  const lowerText = chatText.toLowerCase();
  
  // Extract entities
  const entities = extractEntitiesFromText(chatText);
  
  // Determine primary intent
  let primaryIntent = "browsing";
  const intentPatterns = [
    { pattern: /how (to|do|can|should) .*(grow|plant|cultivate|raise|farm)/i, intent: "learning" },
    { pattern: /what (is|are) .*(best|recommended|good|suitable)/i, intent: "recommendation" },
    { pattern: /how (to|do|can|should) .*(control|manage|prevent|treat|cure|fix)/i, intent: "problem-solving" },
    { pattern: /(buy|purchase|order|get|looking for|need to get|want to buy)/i, intent: "purchasing" },
    { pattern: /(compare|difference between|better than|versus|vs)/i, intent: "comparison" },
    { pattern: /(price|cost|expensive|cheap|affordable)/i, intent: "price-inquiry" },
    { pattern: /(water|spray|spraying|irrigate|irrigation|watering)/i, intent: "watering" }
  ];
  
  for (const { pattern, intent } of intentPatterns) {
    if (pattern.test(lowerText)) {
      primaryIntent = intent;
      break;
    }
  }
  
  // Determine secondary intents
  const secondaryIntents: string[] = [];
  intentPatterns.forEach(({ pattern, intent }) => {
    if (intent !== primaryIntent && pattern.test(lowerText)) {
      secondaryIntents.push(intent);
    }
  });
  
  // Determine sentiment (simple approach)
  let sentiment = 0;
  const positiveWords = ['good', 'great', 'excellent', 'best', 'like', 'love', 'helpful', 'useful', 'effective'];
  const negativeWords = ['bad', 'poor', 'terrible', 'worst', 'dislike', 'hate', 'unhelpful', 'useless', 'ineffective'];
  
  const words = lowerText.split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
    if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
  });
  
  sentiment = (positiveCount - negativeCount) / Math.max(1, positiveCount + negativeCount);
  
  // Determine urgency
  let urgency = 0;
  const urgentWords = ['urgent', 'immediately', 'quickly', 'asap', 'emergency', 'soon', 'hurry', 'fast'];
  const urgencyCount = words.filter(word => urgentWords.some(uw => word.includes(uw))).length;
  urgency = Math.min(1, urgencyCount * 0.25);
  
  // Determine stage
  let stage = "research";
  if (primaryIntent === "purchasing" || lowerText.includes('buy') || lowerText.includes('purchase')) {
    stage = "ready-to-buy";
  } else if (primaryIntent === "problem-solving" || entities.problems.length > 0) {
    stage = "problem-solving";
  }
  
  return {
    primaryIntent,
    secondaryIntents,
    entities,
    sentiment,
    urgency,
    stage
  };
};

/**
 * Get product recommendations using Gemini AI with intent understanding
 * @param chatText - The text from user's chat
 * @param intentAnalysis - The intent analysis result
 * @param limit - Maximum number of products to return
 * @returns Promise resolving to an array of recommended products
 */
const getGeminiRecommendationsWithIntent = async (
  chatText: string,
  intentAnalysis: IntentAnalysis,
  limit: number = 10  // Increased default limit to show more recommendations
): Promise<Product[]> => {
  try {
    console.log('Getting AI recommendations with intent analysis for:', chatText);
    
    // Get the model
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME
    });
    
    // Create a list of product categories and subcategories for context
    const productCategories = [...new Set(products.map(p => p.category))];
    
    // Create a filtered product catalog based on intent analysis
    let filteredProducts = [...products];
    
    // Filter by entities if available
    if (intentAnalysis.entities.crops.length > 0 || 
        intentAnalysis.entities.problems.length > 0 || 
        intentAnalysis.entities.products.length > 0) {
      
      filteredProducts = products.filter(product => {
        const productText = `${product.name} ${product.description} ${product.category} ${product.subcategory}`.toLowerCase();
        
        // Check if product matches any crop
        const matchesCrop = intentAnalysis.entities.crops.some(crop => 
          productText.includes(crop.toLowerCase())
        );
        
        // Check if product matches any problem
        const matchesProblem = intentAnalysis.entities.problems.some(problem => 
          productText.includes(problem.toLowerCase())
        );
        
        // Check if product matches any product category
        const matchesProductCategory = intentAnalysis.entities.products.some(category => 
          product.category === category
        );
        
        return matchesCrop || matchesProblem || matchesProductCategory;
      });
      
      // If no matches, use all products
      if (filteredProducts.length === 0) {
        filteredProducts = products;
      }
    }
    
    // Limit the number of products to send to Gemini to avoid token limits
    const simplifiedProducts = filteredProducts.slice(0, 50).map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
      description: p.description.substring(0, 100) // Truncate description
    }));
    
    // Craft prompt for structured output with intent information
    const prompt = `
You are an expert agricultural product recommendation system. Based on the user's chat message and intent analysis, recommend the most relevant agricultural products from our catalog.

User's chat message: "${chatText}"

Intent Analysis:
- Primary Intent: ${intentAnalysis.primaryIntent}
- Secondary Intents: ${intentAnalysis.secondaryIntents.join(', ')}
- Entities:
  - Crops: ${intentAnalysis.entities.crops.join(', ')}
  - Problems: ${intentAnalysis.entities.problems.join(', ')}
  - Activities: ${intentAnalysis.entities.activities.join(', ')}
  - Product Categories: ${intentAnalysis.entities.products.join(', ')}
- User Stage: ${intentAnalysis.stage}

Our product catalog has the following categories: ${productCategories.join(', ')}

Here's a filtered list of our products that might be relevant:
${JSON.stringify(simplifiedProducts, null, 2)}

Based on the user's message and intent analysis, recommend ${limit} most relevant products. Format your response as valid JSON with the following structure:
[
  {
    "productId": <numeric id from the catalog>,
    "productName": <exact product name from the catalog>,
    "category": <product category>,
    "reason": <brief explanation of why this product is relevant based on the user's intent and needs>
  }
]

Focus on matching products that directly address what the user is asking about, considering their intent and the entities mentioned. For example:
- If they're in problem-solving mode for rice diseases, recommend appropriate pesticides or fungicides
- If they're ready to buy tomato growing supplies, recommend tomato seeds and relevant fertilizers
- If they're researching wheat cultivation, recommend educational products and basic wheat growing supplies

Return ONLY the JSON array with your recommendations, nothing else.
`;
    
    // Generate content with structured output
    console.log('Sending intent-aware prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text || text.trim() === '') {
      console.error('Received empty response from Gemini');
      return getDefaultRecommendations(limit);
    }
    
    // Try to parse the response as JSON
    try {
      // Extract JSON from the response (it might be wrapped in code blocks)
      const jsonMatch = text.match(/```(?:json)?([\s\S]*?)```/) || 
                       text.match(/\[([\s\S]*?)\]/);
                       
      const jsonText = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : text;
      const recommendations = JSON.parse(jsonText) as {
        productId: string;
        productName: string;
        category: string;
        reason: string;
      }[];
      
      console.log('Parsed recommendations from Gemini:', recommendations);
      
      // Map the recommended product IDs to actual products from our catalog
      const recommendedProducts: Product[] = [];
      
      for (const rec of recommendations) {
        // Try to find the product by ID first
        let product = products.find(p => p.id === Number(rec.productId));
        
        // If not found by ID, try to find by name
        if (!product) {
          product = products.find(p => 
            p.name.toLowerCase() === rec.productName.toLowerCase() ||
            p.name.toLowerCase().includes(rec.productName.toLowerCase())
          );
        }
        
        // If still not found, try to find by category
        if (!product && rec.category) {
          const categoryProducts = products.filter(p => 
            p.category.toLowerCase() === rec.category.toLowerCase()
          );
          
          if (categoryProducts.length > 0) {
            // Sort by rating and take the top one
            product = categoryProducts.sort((a, b) => b.rating - a.rating)[0];
          }
        }
        
        if (product && !recommendedProducts.some(p => p.id === product!.id)) {
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
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.log('Raw response:', text);
      
      // Fallback to default recommendations
      return getDefaultRecommendations(limit);
    }
  } catch (error) {
    console.error('Error getting recommendations from Gemini:', error);
    return getDefaultRecommendations(limit);
  }
};

/**
 * Analyze chat history to understand user context over time
 * @param chatHistory - Array of chat messages
 * @returns Context analysis result
 */
const analyzeChatHistory = (chatHistory: { role: string; content: string }[]): {
  recentTopics: string[];
  persistentInterests: string[];
  knowledgeLevel: string;
} => {
  // Extract user messages
  const userMessages = chatHistory.filter(msg => msg.role === 'user').map(msg => msg.content);
  
  if (userMessages.length === 0) {
    return {
      recentTopics: [],
      persistentInterests: [],
      knowledgeLevel: 'beginner'
    };
  }
  
  // Analyze all messages to find persistent interests
  const allEntities = userMessages.map(msg => extractEntitiesFromText(msg));
  
  // Count entity occurrences
  const entityCounts: Record<string, number> = {};
  
  allEntities.forEach(entities => {
    [...entities.crops, ...entities.problems, ...entities.activities].forEach(entity => {
      entityCounts[entity] = (entityCounts[entity] || 0) + 1;
    });
  });
  
  // Get persistent interests (mentioned multiple times)
  const persistentInterests = Object.entries(entityCounts)
    .filter(([_, count]) => count > 1)
    .map(([entity]) => entity);
  
  // Get recent topics from the last 2 messages
  const recentMessages = userMessages.slice(-2);
  const recentEntities = recentMessages.map(msg => extractEntitiesFromText(msg));
  
  const recentTopics = Array.from(new Set(
    recentEntities.flatMap(entities => [
      ...entities.crops,
      ...entities.problems,
      ...entities.activities
    ])
  ));
  
  // Determine knowledge level based on language complexity and specificity
  let knowledgeLevel = 'beginner';
  
  // Check for technical terms that indicate expertise
  const expertTerms = [
    'nitrogen fixation', 'photosynthesis', 'germination rate', 'soil ph', 'micronutrients',
    'macronutrients', 'crop rotation', 'integrated pest management', 'foliar feeding',
    'vernalization', 'hydroponics', 'aquaponics', 'mycorrhizal', 'rhizobium'
  ];
  
  const technicalTermCount = userMessages.reduce((count, msg) => {
    const lowerMsg = msg.toLowerCase();
    return count + expertTerms.filter(term => lowerMsg.includes(term)).length;
  }, 0);
  
  if (technicalTermCount >= 3) {
    knowledgeLevel = 'expert';
  } else if (technicalTermCount >= 1) {
    knowledgeLevel = 'intermediate';
  }
  
  return {
    recentTopics,
    persistentInterests,
    knowledgeLevel
  };
};

/**
 * Get default recommendations (top-rated products)
 * @param limit - Maximum number of products to return
 * @returns Array of top-rated products
 */
export const getDefaultRecommendations = (limit: number = 10): Product[] => {
  console.log('Getting default recommendations');
  return [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

/**
 * Get recommended products based on user's recent chat messages using AI techniques
 * @param userId - The user ID
 * @param limit - Maximum number of products to return (default: 10)
 * @returns Promise resolving to an array of recommended products
 */
export const getAIRecommendationsFromChat = async (
  userId: string,
  limit: number = 10  // Increased default limit to show more recommendations
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
    
    // Extract text from all messages in the recent session
    const chatText = recentSession.messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ');
    
    console.log('Analyzing chat text with AI:', chatText);
    
    // Convert messages to format for history analysis
    const chatHistory = recentSession.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Analyze chat history for context
    const historyAnalysis = analyzeChatHistory(chatHistory);
    console.log('Chat history analysis:', historyAnalysis);
    
    // Analyze intent
    const intentAnalysis = analyzeIntent(chatText);
    console.log('Intent analysis:', intentAnalysis);
    
    // Get recommendations using Gemini with intent understanding
    const recommendations = await getGeminiRecommendationsWithIntent(
      chatText,
      intentAnalysis,
      limit
    );
    
    return recommendations;
  } catch (error) {
    console.error('Error getting AI recommendations from chat:', error);
    return getDefaultRecommendations(limit);
  }
};

/**
 * Get AI recommendations based on a specific query
 * @param query - The user's query
 * @param limit - Maximum number of products to return
 * @returns Promise resolving to an array of recommended products
 */
export const getAIRecommendationsFromQuery = async (
  query: string,
  limit: number = 10  // Increased default limit to show more recommendations
): Promise<Product[]> => {
  try {
    console.log('Getting AI recommendations for query:', query);
    
    // Analyze intent
    const intentAnalysis = analyzeIntent(query);
    console.log('Query intent analysis:', intentAnalysis);
    
    // Get recommendations using Gemini with intent understanding
    const recommendations = await getGeminiRecommendationsWithIntent(
      query,
      intentAnalysis,
      limit
    );
    
    return recommendations;
  } catch (error) {
    console.error('Error getting AI recommendations from query:', error);
    return getDefaultRecommendations(limit);
  }
};