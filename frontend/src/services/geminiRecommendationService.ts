import { Product, products } from '@/data/productData';
import { GoogleGenerativeAI } from '@google/generative-ai';

// API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Validate API key
if (!GEMINI_API_KEY) {
  console.error('Error: VITE_GEMINI_API_KEY is missing in environment variables');
}

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

// Use the correct model name as identified by Google
const MODEL_NAME = 'gemini-1.5-flash'; // Using the free Gemini 1.5 Flash model

/**
 * Interface for product recommendation response from Gemini
 */
interface GeminiProductRecommendation {
  productId: string;
  productName: string;
  category: string;
  reason: string;
}

/**
 * Get product recommendations using Gemini AI
 * @param chatText - The text from user's chat
 * @param limit - Maximum number of products to return
 * @returns Promise resolving to an array of recommended products
 */
export const getGeminiRecommendations = async (chatText: string, limit: number = 3): Promise<Product[]> => {
  try {
    console.log('Getting product recommendations from Gemini for:', chatText);
    
    // Get the model
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME
    });
    
    // Create a list of product categories and subcategories for context
    const productCategories = [...new Set(products.map(p => p.category))];
    const productSubcategories = [...new Set(products.map(p => p.subcategory))];
    
    // Create a simplified product catalog for context
    const simplifiedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory
    }));
    
    // Craft prompt for structured output
    const prompt = `
You are an expert agricultural product recommendation system. Based on the user's chat message, recommend the most relevant agricultural products from our catalog.

User's chat message: "${chatText}"

Our product catalog has the following categories: ${productCategories.join(', ')}
And subcategories: ${productSubcategories.join(', ')}

Here's a simplified list of our products:
${JSON.stringify(simplifiedProducts.slice(0, 50), null, 2)}

Based on the user's message, recommend ${limit} most relevant products. Format your response as valid JSON with the following structure:
[
  {
    "productId": <numeric id from the catalog>,
    "productName": <exact product name from the catalog>,
    "category": <product category>,
    "reason": <brief explanation of why this product is relevant>
  }
]

Focus on matching products that directly address what the user is asking about. For example:
- If they ask about rice herbicides, recommend herbicide products suitable for rice
- If they ask about tomato growing, recommend tomato seeds and relevant fertilizers
- If they mention a specific crop disease, recommend appropriate pesticides or fungicides

Return ONLY the JSON array with your recommendations, nothing else.
`;
    
    // Generate content with structured output
    console.log('Sending prompt to Gemini...');
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
      const recommendations = JSON.parse(jsonText) as GeminiProductRecommendation[];
      
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