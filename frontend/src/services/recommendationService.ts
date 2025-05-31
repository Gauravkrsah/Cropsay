import { Product, products as allProducts } from '@/data/productData';
import { chatService } from './chatService';
import { agriculturalKnowledgeGraph } from '@/data/agriculturalKnowledgeGraph';

/**
 * Service for generating product recommendations based on user chat history
 */

// Common agricultural keywords mapped to product categories
const keywordToCategoryMap: Record<string, string[]> = {
  // Seeds related keywords
  'seed': ['Seeds'],
  'seeds': ['Seeds'],
  'plant': ['Seeds'],
  'growing': ['Seeds', 'Fertilizers'],
  'tomato': ['Seeds'],
  'sow': ['Seeds'],
  'germinate': ['Seeds'],
  'seedling': ['Seeds'],
  'crop': ['Seeds'],
  'wheat': ['Seeds'],
  'rice': ['Seeds'],
  'maize': ['Seeds'],
  'corn': ['Seeds'],
  'vegetable': ['Seeds'],
  'fruit': ['Seeds'],
  'flower': ['Seeds'],
  'chili': ['Seeds'],
  'cucumber': ['Seeds'],
  'paddy': ['Seeds'],
  'mustard': ['Seeds'],
  'garlic': ['Seeds'],

  // Fertilizer related keywords
  'fertilizer': ['Fertilizers'],
  'fertilizers': ['Fertilizers'],
  'nutrient': ['Fertilizers'],
  'nutrients': ['Fertilizers'],
  'npk': ['Fertilizers'],
  'nitrogen': ['Fertilizers'],
  'phosphorus': ['Fertilizers'],
  'potassium': ['Fertilizers'],
  'organic': ['Fertilizers'],
  'compost': ['Fertilizers'],
  'manure': ['Fertilizers'],
  'vermicompost': ['Fertilizers'],
  'biofertilizer': ['Fertilizers'],
  'micronutrient': ['Fertilizers'],
  'macronutrient': ['Fertilizers'],

  // Pesticide related keywords
  'pest': ['Pesticides'],
  'pests': ['Pesticides'],
  'insect': ['Pesticides'],
  'insects': ['Pesticides'],
  'disease': ['Pesticides'],
  'diseases': ['Pesticides'],
  'fungus': ['Pesticides'],
  'fungi': ['Pesticides'],
  'weed': ['Pesticides'],
  'weeds': ['Pesticides'],
  'pesticide': ['Pesticides'],
  'insecticide': ['Pesticides'],
  'fungicide': ['Pesticides'],
  'herbicide': ['Pesticides'],
  'roundup': ['Pesticides'],
  'glyphosate': ['Pesticides'],
  'chlorpyrifos': ['Pesticides'],
  'mancozeb': ['Pesticides'],

  // Tools & Equipment related keywords
  'tool': ['Tools & Equipment'],
  'tools': ['Tools & Equipment'],
  'equipment': ['Tools & Equipment'],
  'machine': ['Tools & Equipment'],
  'machinery': ['Tools & Equipment'],
  'harvester': ['Tools & Equipment'],
  'tractor': ['Tools & Equipment'],
  'sprayer': ['Tools & Equipment'],
  'seeder': ['Tools & Equipment'],
  'transplanter': ['Tools & Equipment'],
  'plow': ['Tools & Equipment'],
  'plough': ['Tools & Equipment'],
  'hoe': ['Tools & Equipment'],
  'spade': ['Tools & Equipment'],
  'shovel': ['Tools & Equipment'],
  'sickle': ['Tools & Equipment'],

  // Irrigation related keywords
  'water': ['Irrigation'],
  'irrigation': ['Irrigation'],
  'drip': ['Irrigation'],
  'sprinkler': ['Irrigation'],
  'pipe': ['Irrigation'],
  'pump': ['Irrigation'],
  'moisture': ['Irrigation'],
  'rain': ['Irrigation'],
  'rainfall': ['Irrigation'],
  'drought': ['Irrigation'],
  'flood': ['Irrigation'],
  'watering': ['Irrigation'],
};

// Make a copy of products to avoid modifying the original
const products = [...allProducts];

/**
 * Extract keywords from a text string
 * @param text - The text to extract keywords from
 * @returns Array of extracted keywords
 */
const extractKeywords = (text: string): string[] => {
  if (!text) return [];
  
  // Convert to lowercase and remove special characters
  const cleanedText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // Split into words
  const words = cleanedText.split(/\s+/);
  
  // Filter out common stop words and short words
  const stopWords = new Set(['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'or', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'in', 'out', 'no', 'not', 'so', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'or', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'in', 'out', 'no', 'not', 'so', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'or', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'in', 'out', 'no', 'not', 'so', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'or', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'in', 'out', 'no', 'not', 'so', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'or', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'in', 'out', 'no', 'not', 'so', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those']);
  
  const keywords = words.filter(word => 
    word.length > 2 && !stopWords.has(word) && Object.keys(keywordToCategoryMap).includes(word)
  );
  
  return [...new Set(keywords)]; // Remove duplicates
};

/**
 * Get product categories based on extracted keywords
 * @param keywords - Array of keywords
 * @returns Array of product categories
 */
const getCategoriesFromKeywords = (keywords: string[]): string[] => {
  const categories = new Set<string>();
  
  keywords.forEach(keyword => {
    const mappedCategories = keywordToCategoryMap[keyword];
    if (mappedCategories) {
      mappedCategories.forEach(category => categories.add(category));
    }
  });
  
  return Array.from(categories);
};

/**
 * Calculate TF-IDF vector for a document
 * @param document - The document text
 * @param allDocuments - All documents in the corpus
 * @returns TF-IDF vector as a Map of term to score
 */
const calculateTfIdf = (document: string, allDocuments: string[]): Map<string, number> => {
  // Tokenize the document
  const tokens = document.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !stopWords.has(token));
  
  // Calculate term frequency
  const tf = new Map<string, number>();
  tokens.forEach(token => {
    tf.set(token, (tf.get(token) || 0) + 1);
  });
  
  // Calculate inverse document frequency
  const idf = new Map<string, number>();
  tokens.forEach(token => {
    if (!idf.has(token)) {
      // Count documents containing this token
      const docsWithTerm = allDocuments.filter(doc => 
        doc.toLowerCase().includes(token)
      ).length;
      
      // Calculate IDF
      const idfValue = Math.log(allDocuments.length / (docsWithTerm || 1));
      idf.set(token, idfValue);
    }
  });
  
  // Calculate TF-IDF
  const tfIdf = new Map<string, number>();
  tokens.forEach(token => {
    const tfValue = tf.get(token) || 0;
    const idfValue = idf.get(token) || 0;
    tfIdf.set(token, tfValue * idfValue);
  });
  
  return tfIdf;
};

/**
 * Calculate cosine similarity between two TF-IDF vectors
 * @param vector1 - First TF-IDF vector
 * @param vector2 - Second TF-IDF vector
 * @returns Cosine similarity score (0-1)
 */
const cosineSimilarity = (vector1: Map<string, number>, vector2: Map<string, number>): number => {
  // Get all unique terms
  const allTerms = new Set([...vector1.keys(), ...vector2.keys()]);
  
  // Calculate dot product
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  allTerms.forEach(term => {
    const value1 = vector1.get(term) || 0;
    const value2 = vector2.get(term) || 0;
    
    dotProduct += value1 * value2;
    magnitude1 += value1 * value1;
    magnitude2 += value2 * value2;
  });
  
  // Calculate magnitudes
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  // Calculate cosine similarity
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  
  return dotProduct / (magnitude1 * magnitude2);
};

// Set of common stop words to filter out
const stopWords = new Set(['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'or', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'in', 'out', 'no', 'not', 'so', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'or', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'in', 'out', 'no', 'not', 'so', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'or', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'in', 'out', 'no', 'not', 'so', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'or', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'in', 'out', 'no', 'not', 'so', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those']);

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
 * Get product recommendations using KNN algorithm
 * @param chatText - The text from user's chat
 * @param limit - Maximum number of products to return
 * @returns Array of recommended products
 */
const getRecommendationsUsingKNN = (chatText: string, limit: number = 3): Product[] => {
  console.log('Using KNN-based recommendations for text:', chatText);
  
  // Extract features from chat text
  const chatFeatures = extractFeaturesFromText(chatText);
  
  // Calculate distances between chat features and product features
  const productDistances = products.map(product => {
    const productFeatures = extractFeaturesFromProduct(product);
    const distance = euclideanDistance(chatFeatures, productFeatures);
    return { product, distance };
  });
  
  // Sort by distance (ascending) and take top N
  return productDistances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(item => item.product);
};

/**
 * Extract feature vector from text
 * @param text - The text to extract features from
 * @returns Feature vector
 */
const extractFeaturesFromText = (text: string): number[] => {
  const lowerText = text.toLowerCase();
  
  // Simple feature vector: [has_garlic, has_seed, has_grow, has_plant, has_fertilizer, has_disease]
  return [
    lowerText.includes('garlic') ? 1 : 0,
    lowerText.includes('seed') ? 1 : 0,
    lowerText.includes('grow') ? 1 : 0,
    lowerText.includes('plant') ? 1 : 0,
    lowerText.includes('fertilizer') || lowerText.includes('fertilize') ? 1 : 0,
    lowerText.includes('disease') || lowerText.includes('pest') ? 1 : 0
  ];
};

/**
 * Extract feature vector from product
 * @param product - The product to extract features from
 * @returns Feature vector
 */
const extractFeaturesFromProduct = (product: Product): number[] => {
  const productText = `${product.name} ${product.description} ${product.category} ${product.subcategory}`.toLowerCase();
  
  // Same feature vector as extractFeaturesFromText
  return [
    productText.includes('garlic') ? 1 : 0,
    productText.includes('seed') ? 1 : 0,
    productText.includes('grow') ? 1 : 0,
    productText.includes('plant') ? 1 : 0,
    productText.includes('fertilizer') || productText.includes('fertilize') ? 1 : 0,
    productText.includes('disease') || productText.includes('pest') ? 1 : 0
  ];
};

/**
 * Get product recommendations using NLP-based similarity
 * @param chatText - The text from user's chat
 * @param limit - Maximum number of products to return
 * @returns Array of recommended products
 */
const getRecommendationsUsingNLP = (chatText: string, limit: number = 3): Product[] => {
  // Create product documents (name + description + category + subcategory)
  const productDocuments = products.map(product => 
    `${product.name} ${product.description} ${product.category} ${product.subcategory}`
  );
  
  // Calculate TF-IDF for chat text
  const chatVector = calculateTfIdf(chatText, productDocuments);
  
  // Calculate similarity scores for each product
  const productScores = products.map((product, index) => {
    const productVector = calculateTfIdf(productDocuments[index], productDocuments);
    const similarity = cosineSimilarity(chatVector, productVector);
    return { product, similarity };
  });
  
  // Sort by similarity score and take top N
  return productScores
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(item => item.product);
};

/**
 * Extract entities from text using the agricultural knowledge graph
 * @param text - The text to extract entities from
 * @returns Array of extracted entities with their types
 */
const extractEntitiesFromText = (text: string): { entity: string, type: string }[] => {
  const entities: { entity: string, type: string }[] = [];
  const lowerText = text.toLowerCase();
  
  // Check for crops
  agriculturalKnowledgeGraph.crops.forEach(crop => {
    if (lowerText.includes(crop.name.toLowerCase())) {
      entities.push({ entity: crop.name, type: 'crop' });
    }
  });
  
  // Check for problems
  agriculturalKnowledgeGraph.problems.forEach(problem => {
    if (lowerText.includes(problem.name.toLowerCase())) {
      entities.push({ entity: problem.name, type: 'problem' });
    }
  });
  
  // Check for activities
  agriculturalKnowledgeGraph.activities.forEach(activity => {
    if (lowerText.includes(activity.name.toLowerCase())) {
      entities.push({ entity: activity.name, type: 'activity' });
    }
  });
  
  return entities;
};

/**
 * Get product recommendations using knowledge graph and entity extraction
 * @param chatText - The text from user's chat
 * @param limit - Maximum number of products to return
 * @returns Array of recommended products
 */
const getRecommendationsUsingKnowledgeGraph = (chatText: string, limit: number = 3): Product[] => {
  console.log('Using knowledge graph for recommendations');
  
  // Extract entities from the chat text
  const entities = extractEntitiesFromText(chatText);
  console.log('Extracted entities:', entities);
  
  if (entities.length === 0) {
    console.log('No entities found in chat text');
    return [];
  }
  
  // Score products based on relevance to entities
  const productScores = products.map(product => {
    let score = 0.1; // Base score
    const productText = `${product.name} ${product.description} ${product.category} ${product.subcategory}`.toLowerCase();
    
    // Score based on entity matches
    entities.forEach(entity => {
      if (productText.includes(entity.entity.toLowerCase())) {
        // Higher score for crop matches
        if (entity.type === 'crop') {
          score += 3;
        } 
        // Medium score for problem matches (like diseases)
        else if (entity.type === 'problem') {
          score += 2;
        }
        // Lower score for activity matches
        else {
          score += 1;
        }
      }
      
      // Special case for garlic
      if (entity.entity.toLowerCase() === 'garlic' && 
          (product.category === 'Seeds' || product.name.toLowerCase().includes('seed'))) {
        score += 5; // Boost score for seed products when garlic is mentioned
        console.log('Boosting score for garlic seed product:', product.name);
      }
    });
    
    return { product, score };
  });
  
  // Sort by score and take top N
  const sortedProducts = productScores.sort((a, b) => b.score - a.score);
  console.log('Top scored products:', sortedProducts.slice(0, 3).map(p => `${p.product.name}: ${p.score}`));
  
  return productScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product);
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
      // Return default recommendations instead of empty array
      return getDefaultRecommendations(limit);
    }
    
    // Extract text from all messages in the recent session
    const chatText = recentSession.messages
      .map(msg => msg.content)
      .join(' ');
    
    console.log('Analyzing chat text:', chatText);
    
    // Try KNN recommendations first
    const knnRecommendations = getRecommendationsUsingKNN(chatText, limit);
    
    // If we got good recommendations, return them
    if (knnRecommendations.length > 0) {
      console.log('Using KNN recommendations');
      return knnRecommendations;
    }
    
    // Try knowledge graph recommendations first
    const knowledgeGraphRecommendations = getRecommendationsUsingKnowledgeGraph(chatText, limit);
    
    // If we got good recommendations, return them
    if (knowledgeGraphRecommendations.length > 0) {
      console.log('Using knowledge graph recommendations');
      return knowledgeGraphRecommendations;
    }
    
    // Try NLP-based recommendations first
    const nlpRecommendations = getRecommendationsUsingNLP(chatText, limit);
    
    // If we got good recommendations, return them
    if (nlpRecommendations.length > 0) {
      console.log('Using NLP-based recommendations');
      return nlpRecommendations;
    }
    
    // Fallback to keyword-based approach
    console.log('Falling back to keyword-based approach');
    const keywords = extractKeywords(chatText);
    console.log('Extracted keywords:', keywords);

    
// If no keywords found, try to extract topics from the knowledge graph
    if (keywords.length === 0) {
      // Look for any agricultural terms in the chat
      const allTerms = Object.keys(keywordToCategoryMap);
      const foundTerms = allTerms.filter(term => chatText.toLowerCase().includes(term.toLowerCase()));
      return getDefaultRecommendations(limit);
    }

    const categories = getCategoriesFromKeywords(keywords);
    if (categories.length === 0) {
      return [];
    }
    
    // Filter products by the identified categories
    let recommendedProducts = products.filter(product => 
      categories.includes(product.category)
    );
    
    // If we have too many products, sort by rating and take the top ones
    if (recommendedProducts.length > limit) {
      recommendedProducts = recommendedProducts
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    }
    
    // If we don't have enough products, add some top-rated ones
    if (recommendedProducts.length < limit) {
      const topRatedProducts = products
        .filter(p => !recommendedProducts.some(rp => rp.id === p.id))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit - recommendedProducts.length);
      
      recommendedProducts = [...recommendedProducts, ...topRatedProducts];
    }
    
    // Shuffle the recommendations for variety
    return recommendedProducts.sort(() => Math.random() - 0.5);
    
  } catch (error) {
    console.error('Error getting recommendations from chat:', error);
    return [];
  }
};

/**
 * Get default recommendations (top-rated products)
 * @param limit - Maximum number of products to return
 * @returns Array of top-rated products
 */
export const getDefaultRecommendations = (limit: number = 5): Product[] => {
  console.log('Getting default recommendations');
  return [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};