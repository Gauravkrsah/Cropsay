/**
 * Gemini AI Service
 * Uses the official Google Generative AI SDK with the Gemini 2.5 Pro Preview model
 * Implements structured output for product recommendations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerateContentStreamResult } from '@google/generative-ai';
import { agriculturalKnowledgeGraph } from '@/data/agriculturalKnowledgeGraph';

// API key
const GEMINI_API_KEY = '***REMOVED***';

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Use the correct model name as identified by Google
const MODEL_NAME = 'gemini-1.5-flash'; // Using the free Gemini 1.5 Flash model
const RETRY_ATTEMPTS = 2; // Number of retry attempts if the API call fails

// List of common agricultural terms for query detection
const AGRICULTURAL_KEYWORDS = {
  crops: [
    ...agriculturalKnowledgeGraph.crops.map(crop => crop.name.toLowerCase()),
    'corn', 'maize', 'soybean', 'cotton', 'wheat', 'barley', 'oats', 'rye', 'millet',
    'rice', 'sugarcane', 'sugarbeet', 'potato', 'sweet potato', 'cassava', 'yam',
    'taro', 'garlic', 'onion', 'leek', 'shallot', 'chive', 'tomato', 'eggplant',
    'pepper', 'bell pepper', 'chili', 'cucumber', 'squash', 'pumpkin', 'zucchini',
    'watermelon', 'melon', 'cantaloupe', 'lettuce', 'spinach', 'kale', 'cabbage',
    'broccoli', 'cauliflower', 'brussels sprout', 'carrot', 'beet', 'radish', 'turnip',
    'parsnip', 'bean', 'pea', 'lentil', 'chickpea', 'soybean', 'peanut', 'apple',
    'pear', 'peach', 'plum', 'apricot', 'cherry', 'grape', 'strawberry', 'raspberry',
    'blackberry', 'blueberry', 'cranberry', 'banana', 'plantain', 'mango', 'papaya',
    'avocado', 'coconut', 'olive', 'cashew', 'almond', 'walnut', 'pecan', 'coffee',
    'tea', 'cocoa', 'rubber', 'jute', 'hemp', 'flax', 'cotton'
  ],
  problems: [
    ...agriculturalKnowledgeGraph.problems.map(problem => problem.name.toLowerCase()),
    'aphid', 'beetle', 'caterpillar', 'thrip', 'whitefly', 'mealybug', 'scale insect',
    'mite', 'nematode', 'slug', 'snail', 'rodent', 'bird damage', 'deer damage',
    'fungal infection', 'rust', 'powdery mildew', 'downy mildew', 'blight', 'rot',
    'damping off', 'wilt', 'scab', 'canker', 'leaf spot', 'bacterial infection', 
    'viral infection', 'mosaic virus', 'black spot', 'sooty mold', 'crown gall',
    'drought stress', 'heat stress', 'frost damage', 'sunscald', 'waterlogging',
    'nutrient deficiency', 'nitrogen deficiency', 'phosphorus deficiency',
    'potassium deficiency', 'calcium deficiency', 'magnesium deficiency',
    'iron deficiency', 'manganese deficiency', 'zinc deficiency', 'boron deficiency',
    'toxicity', 'herbicide damage', 'salt damage', 'pollution damage'
  ],
  activities: [
    ...agriculturalKnowledgeGraph.activities.map(activity => activity.name.toLowerCase()),
    'tilling', 'plowing', 'harrowing', 'seeding', 'transplanting', 'mulching',
    'fertilizing', 'spraying', 'irrigation', 'watering', 'weeding', 'hoeing',
    'pruning', 'training', 'trellising', 'staking', 'harvesting', 'picking',
    'threshing', 'winnowing', 'drying', 'storing', 'processing', 'milling',
    'crushing', 'extracting', 'packaging', 'marketing', 'selling', 'transporting',
    'crop rotation', 'intercropping', 'companion planting', 'succession planting',
    'cover cropping', 'green manuring', 'composting', 'vermicomposting',
    'organic farming', 'conventional farming', 'sustainable farming', 'conservation tillage',
    'no-till farming', 'permaculture', 'agroforestry', 'hydroponics', 'aquaponics',
    'aeroponics', 'greenhouse cultivation', 'protected cultivation'
  ],
  general: [
    'farm', 'farming', 'agriculture', 'agricultural', 'crop', 'plant', 'soil', 'seed', 
    'fertilizer', 'pesticide', 'insecticide', 'herbicide', 'fungicide', 'irrigation',
    'harvest', 'cultivation', 'organic', 'greenhouse', 'garden', 'gardening', 'compost',
    'hydroponics', 'aeroponics', 'germination', 'propagation', 'pruning', 'pollination',
    'yield', 'drought', 'pest', 'weed', 'disease', 'blight', 'nutrient', 'deficiency',
    'tractor', 'plow', 'harvester', 'thresher', 'sprayer', 'cultivator', 'seeder',
    'combine', 'irrigation system', 'drip irrigation', 'sprinkler', 'furrow irrigation',
    'flood irrigation', 'fertigation', 'soil testing', 'pH', 'loam', 'clay', 'sandy',
    'silt', 'topsoil', 'subsoil', 'humus', 'compost', 'manure', 'organic matter',
    'rotation', 'fallow', 'sustainable', 'regenerative', 'ecology', 'ecosystem',
    'biodiversity', 'pollinator', 'beneficial insects', 'predatory insects', 'bees',
    'apiculture', 'beekeeping', 'horticulture', 'viticulture', 'floriculture',
    'arboriculture', 'silviculture', 'aquaculture', 'mariculture', 'livestock', 
    'cattle', 'poultry', 'pigs', 'sheep', 'goats', 'dairy', 'ranch', 'grazing', 
    'pasture', 'forage', 'fodder', 'silage', 'hay', 'straw', 'growing season',
    'planting season', 'harvest season', 'frost date', 'hardiness zone'
  ]
};

/**
 * Determines if a query is related to agriculture based on content
 * @param query - The user query to analyze
 * @returns boolean indicating if the query is agriculture-related
 */
export function isAgriculturalQuery(query: string): boolean {
  // Handle edge cases
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return false;
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Common prefixes and question patterns that should be ignored during matching
  const ignoredPrefixes = [
    'can you', 'could you', 'would you', 'how to', 'how do i', 'how can i',
    'what is', 'what are', 'tell me about', 'explain', 'describe',
    'i want to know', 'i need to know', 'can i ask', 'please tell me',
    'i need help with', 'help me with', 'i have a question about',
    'is it possible to', 'do you know', 'can we'
  ];
  
  // Remove common prefixes to focus on the core question
  let cleanedQuery = normalizedQuery;
  for (const prefix of ignoredPrefixes) {
    if (cleanedQuery.startsWith(prefix)) {
      cleanedQuery = cleanedQuery.substring(prefix.length).trim();
      break;
    }
  }
  
  // Check for obviously non-agricultural topics - immediate rejection patterns
  const nonAgriculturalPatterns = [
    /\b(bitcoin|crypto|cryptocurrency|blockchain|nft)\b/i,
    /\b(stock market|stocks|forex|trading)\b/i,
    /\b(movie|film|tv show|television|netflix|disney|hulu)\b/i,
    /\b(video game|playstation|xbox|nintendo|gaming)\b/i,
    /\b(dating|relationship advice|breakup|marriage counseling)\b/i,
    /\b(politics|election|democrat|republican|voting|president)\b/i,
    /\b(tell me a joke|funny story|riddle|puzzle)\b/i,
    /\b(write|generate) (an?|the) (essay|poem|story|novel|script)\b/i
  ];
  
  // If we match any non-agricultural patterns, reject immediately
  if (nonAgriculturalPatterns.some(pattern => pattern.test(normalizedQuery))) {
    return false;
  }
  
  // Check if query contains any agricultural keywords
  for (const category in AGRICULTURAL_KEYWORDS) {
    if (AGRICULTURAL_KEYWORDS[category].some(keyword => {
      // Check for whole word matches or word boundaries when possible
      const keywordRegex = new RegExp(`\\b${keyword}\\b|\\b${keyword}s\\b|\\b${keyword}es\\b|\\b${keyword}ing\\b`, 'i');
      return keywordRegex.test(normalizedQuery) || keywordRegex.test(cleanedQuery);
    })) {
      return true;
    }
  }
  
  // Enhanced agricultural patterns check
  const agriculturalPatterns = [
    /\b(grow|plant|harvest|cultivat|irrigat|prune|fertiliz|compost|mulch|transplant|propagat)ing?\b/i,
    /\b(crop|plant|soil|seed|farm|garden|field|nursery|orchard|vineyard) (care|health|management|rotation|yield|production)\b/i,
    /\bseason\b.*\b(plant|grow|harvest|crop|sow|cultivat)\b/i,
    /\b(organic|sustainable|traditional|regenerative|biodynamic) (farm|agricult|grow|cultivat|garden)/i,
    /\b(pest|disease|weed|insect|fungus|bacteria|virus|drought|flood) (control|management|prevention|treatment|resistant)\b/i,
    /\b(hydropon|aquapon|aeropon|vertical farm|greenhouse|hoop house|high tunnel)\b/i,
    /\b(livestock|cattle|poultry|goat|sheep|pig|chicken|duck|horse|animal) (feed|breeding|health|management|housing)\b/i,
    /\b(soil|compost|fertilizer|mulch|amendment|nutrient|ph|irrigation) (test|management|application|schedule)\b/i,
    /\bhow (long|often|much) (water|fertilize|harvest|prune|plant|space)\b/i,
    /\b(what|when|how) to (plant|harvest|grow|prune|fertilize|water|sow|cultivate|propagate)\b/i
  ];
  
  if (agriculturalPatterns.some(pattern => pattern.test(normalizedQuery) || pattern.test(cleanedQuery))) {
    return true;
  }
  
  // If the query explicitly mentions agriculture, farming, gardening, etc.
  const explicitAgTerms = [
    'agriculture', 'agricultural', 'farming', 'gardening', 'horticulture', 'crop', 'plant', 
    'cultivation', 'harvest', 'soil', 'seed', 'grow', 'farm', 'garden'
  ];
  
  for (const term of explicitAgTerms) {
    if (normalizedQuery.includes(term) || cleanedQuery.includes(term)) {
      return true;
    }
  }
  
  return false;
}

// Interface for structured product recommendations
interface ProductRecommendation {
  productId: string;
  productName: string;
  reason: string;
}

interface GeminiResponse {
  answer: string;
  productRecommendations: ProductRecommendation[];
}

export const geminiService = {
  /**
   * Generate a response using Gemini AI with structured output for product recommendations
   * @param messages - Array of previous messages in the conversation
   * @param onTokenReceived - Optional callback function that receives tokens as they arrive
   * @returns The complete AI response when finished
   */
  generateResponse: async (
    messages: { role: string; content: string }[], 
    onTokenReceived?: (token: string) => void
  ): Promise<string> => {
    // Extract the user's question outside try block to make it available in catch
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    
    if (!lastUserMessage) {
      console.error('No user message found in messages array');
      return "I couldn't process your message. Please try again.";
    }

    const userQuestion = lastUserMessage.content;
    console.log('User question:', userQuestion);

    // Get recent chat history for context (excluding the last user message)
    const recentChatHistory = messages
      .slice(-5, -1) // Get the 4 most recent messages before the current one
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n');

    // Define standard non-agricultural response
    const nonAgriculturalResponse = "I'm your agricultural assistant for CropsayAI. I can only answer questions related to farming, agriculture, plants, crops, and gardening. Please ask me something related to agriculture, and I'll be happy to help.";
    
    // Check if the query is agriculture-related
    if (!isAgriculturalQuery(userQuestion)) {
      console.log('Non-agricultural query detected, declining to answer');
      
      if (onTokenReceived) {
        // If streaming is requested, we need to send the standard response as a stream
        for (const char of nonAgriculturalResponse) {
          onTokenReceived(char);
          await new Promise(resolve => setTimeout(resolve, 10)); // Small delay to simulate streaming
        }
      }
      
      return nonAgriculturalResponse;
    }
    
    try {
      console.log('Making direct API call to Gemini...');
      const model = genAI.getGenerativeModel({ 
        model: MODEL_NAME,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        }
      });
      
      const prompt = `
You are an expert agricultural assistant for CropsayAI. Answer ONLY questions related to farming, agriculture, plants, crops, or gardening.

User Question: ${userQuestion}

${recentChatHistory ? `Recent conversation context: ${recentChatHistory}` : ''}

Provide a helpful, informative response with practical advice. Focus exclusively on agricultural topics.
`;
      
      // Check if streaming is requested
      if (onTokenReceived) {
        try {
          console.log('Using streaming API...');
          const streamResult = await model.generateContentStream(prompt);
          let fullText = '';
          
          // Process the stream
          for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              fullText += chunkText;
              onTokenReceived(chunkText);
            }
          }
          
          if (fullText && fullText.trim() !== '') {
            console.log('Successfully received streaming response from Gemini API');
            return fullText;
          } else {
            throw new Error('Empty streaming response from Gemini API');
          }
        } catch (streamError) {
          console.error('Streaming API call failed:', streamError);
          
          // Try with fallback model without streaming first
          try {
            console.log('Attempting fallback with simpler model...');
            const fallbackModel = genAI.getGenerativeModel({
              model: 'gemini-1.5-flash'
            });
            
            const fallbackResult = await fallbackModel.generateContent(prompt);
            const fallbackText = fallbackResult.response.text();
            
            if (fallbackText && fallbackText.trim() !== '') {
              // Stream the fallback text character by character
              for (const char of fallbackText) {
                onTokenReceived(char);
                await new Promise(resolve => setTimeout(resolve, 5));
              }
              return fallbackText;
            }
          } catch (fallbackError) {
            console.error('Fallback model also failed:', fallbackError);
          }
          
          // Last resort: return a simple response and stream it
          const errorResponse = "I'm sorry, I'm having trouble connecting to my agricultural knowledge base right now. Please try again in a moment.";
          for (const char of errorResponse) {
            onTokenReceived(char);
            await new Promise(resolve => setTimeout(resolve, 5));
          }
          return errorResponse;
        }
      } else {
        // Use non-streaming API
        console.log('Using non-streaming API...');
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        if (text && text.trim() !== '') {
          console.log('Successfully received response from Gemini API');
          return text;
        }
        
        throw new Error('Empty response from Gemini API');
      }
    } catch (error) {
      console.error('Error in Gemini API call:', error);
      
      // Simplified fallback with one retry
      try {
        console.log('Attempting fallback API call with simpler prompt...');
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash' // Fallback to gemini-1.5-flash which is free
        });
        
        const simplePrompt = `
You are an expert agricultural assistant for CropsayAI. Answer this farming/agriculture question clearly and concisely:
${userQuestion}

Provide a helpful response focused only on agricultural topics.
`;
        
        const result = await model.generateContent(simplePrompt);
        const text = result.response.text();
        
        if (text && text.trim() !== '') {
          return text;
        } else {
          throw new Error('Empty response from fallback API call');
        }
      } catch (directError) {
        console.error('Fallback API call also failed:', directError);
        return "I'm sorry, I couldn't generate a response right now. Please try again in a moment.";
      }
    }
  },
  /**
   * Generate a title for a chat session based on the first message
   * @param message - The first user message in the chat
   * @returns A generated title for the chat
   */  generateChatTitle: async (message: string): Promise<string> => {
    // Input validation to prevent errors
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return "New Agricultural Chat";
    }
    
    // Check if the first message is agriculture-related
    if (!isAgriculturalQuery(message)) {
      return "New Agricultural Chat"; // Default title for non-agricultural conversations
    }
    
    try {
      // Get the model with the correct name
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash' // Using the most reliable model for this simple task
      });
      
      const prompt = `Create a very short title (3-5 words) for an agricultural chat conversation that starts with this message: "${message.slice(0, 100)}". The title must be related to agriculture, farming, gardening, or plants.`;
      
      // Set a timeout to prevent long-running requests
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Title generation timed out')), 5000);
      });
      
      // Race between the actual request and the timeout
      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ]) as any;
      
      const responseText = result.response;
      const title = responseText.text().replace(/["']/g, '').trim();
      
      if (title && title.length > 0) {
        return title.slice(0, 50); // Limit title length
      } else {
        throw new Error('Empty title generated');
      }
    } catch (error) {
      console.error('Error generating chat title:', error);
      
      // Generate a title based on agricultural keywords found in the message
      const normalizedMessage = message.toLowerCase();
      
      // Extract agricultural terms that appear in the message
      const allAgTerms = [...AGRICULTURAL_KEYWORDS.crops, ...AGRICULTURAL_KEYWORDS.problems, 
                          ...AGRICULTURAL_KEYWORDS.activities, ...AGRICULTURAL_KEYWORDS.general];
      
      const foundTerms = allAgTerms.filter(term => normalizedMessage.includes(term));
      
      if (foundTerms.length > 0) {
        // Use the first 1-2 agricultural terms found
        const titleTerms = foundTerms.slice(0, 2).map(term => 
          term.charAt(0).toUpperCase() + term.slice(1) // Capitalize first letter
        );
        return titleTerms.join(' ') + ' Chat';
      }
      
      // If no agricultural terms found, use a simple fallback
      const cleanMessage = message.replace(/[^\w\s]/gi, ' ').trim();
      const words = cleanMessage.split(' ').filter(w => w.length > 0).slice(0, 3);
      return words.join(' ') + ' Chat';
    }
  }
};

/**
 * Helper function to generate a response from Gemini API with retry logic
 * @param userQuestion - The user's question
 * @param chatHistory - Recent chat history for context
 * @returns Formatted response from Gemini
 */
async function generateGeminiResponse(userQuestion: string, chatHistory: string): Promise<string> {
  // Standard non-agricultural response
  const nonAgriculturalResponse = "I'm your agricultural assistant for CropsayAI. I can only answer questions related to farming, agriculture, plants, crops, and gardening. Please ask me something related to agriculture, and I'll be happy to help.";
  
  // First check if the query is agricultural before making API calls
  if (!isAgriculturalQuery(userQuestion)) {
    console.log('Non-agricultural query detected in helper function, returning standard response');
    return nonAgriculturalResponse;
  }
  
  let lastError: any = null;
  
  // Try multiple times in case of temporary API issues
  for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(`Sending to Gemini model (attempt ${attempt + 1}/${RETRY_ATTEMPTS + 1}):`, MODEL_NAME);
      
      // Get the model
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        }
      });
      
      // Improved prompt with clearer agriculture-only instructions
      const standardPrompt = `
You are an expert agricultural assistant for CropsayAI. You STRICTLY ONLY answer questions related to farming, agriculture, plants, crops, and gardening.

User Question: ${userQuestion}
${chatHistory ? `Chat History: ${chatHistory}` : ''}

Provide a helpful, accurate response ONLY about agriculture. If the question is not related to agriculture, you will not answer it.

If you'd like to recommend products, you can format them like this at the end of your response:

**Recommended Products:**
- Product Name: Brief reason why it's recommended
`;

      // Generate content with standard output
      const result = await model.generateContent(standardPrompt);
      const response = result.response;
      let text = response.text();
      
      console.log('Gemini response received');
      
      // Handle empty responses
      if (!text || text.trim() === '') {
        console.error('Received empty response from Gemini');
        // If we're on the last attempt, throw an error
        if (attempt === RETRY_ATTEMPTS) {
          throw new Error('Empty response from Gemini API');
        }
        // Otherwise, try again
        continue;
      }
      
      // Double-check that the response doesn't contain "I can't answer that" type messages,
      // which might indicate the AI detected a non-agricultural question that our filter missed
      const refusalIndicators = [
        "i can't answer", 
        "i cannot answer", 
        "i'm not able to", 
        "i am not able to", 
        "i don't have information",
        "not related to agriculture",
        "doesn't relate to agriculture",
        "not about agriculture",
        "not an agricultural question"
      ];
      
      if (refusalIndicators.some(indicator => text.toLowerCase().includes(indicator))) {
        console.log('Gemini refused to answer, likely detected non-agricultural content');
        return nonAgriculturalResponse;
      }
      
      // Return the text directly
      return text;
      
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${RETRY_ATTEMPTS + 1} failed:`, error);
      lastError = error;
      
      // If this is not the last attempt, wait before retrying with exponential backoff
      if (attempt < RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt))); 
        continue;
      }
    }
  }
  
  // If we've exhausted all retry attempts, return a user-friendly error message
  console.error('All retry attempts failed:', lastError);
  return "I'm sorry, I couldn't generate a response about agriculture at this time. Please try again in a moment.";
}
