/**
 * Dynamic Recommendation Service
 * Uses Gemini to analyze user queries and match with products in the catalog
 */

import { Product, products } from '@/data/productData';
import { GoogleGenerativeAI } from '@google/generative-ai';

// API key
const GEMINI_API_KEY = '***REMOVED***';

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Use Gemini 1.5 Flash model
const MODEL_NAME = 'gemini-1.5-flash';

/**
 * Get product recommendations based on user query using Gemini
 * @param query - The user's query
 * @param limit - Maximum number of products to return
 * @returns Promise resolving to an array of recommended products
 */
export const getDynamicRecommendations = async (
  query: string,
  limit: number = 10
): Promise<Product[]> => {
  try {
    console.log('Getting dynamic recommendations for query:', query);
    
    // Get the model
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME
    });
    
    // Extract all unique categories and subcategories from the product data
    const categories = [...new Set(products.map(p => p.category))];
    const subcategories = [...new Set(products.map(p => p.subcategory))];
    
    // Craft prompt for Gemini to analyze the query and extract relevant categories
    const prompt = `
You are an expert agricultural product recommendation system. Analyze the user's query and identify the most relevant product categories and subcategories.

User's query: "${query}"

Our product catalog has the following categories:
${categories.join(', ')}

And the following subcategories:
${subcategories.join(', ')}

Based on the user's query, identify:
1. The most relevant product categories (from the list above)
2. The most relevant product subcategories (from the list above)
3. Any specific product types or features mentioned in the query

Format your response as valid JSON with the following structure:
{
  "relevantCategories": ["category1", "category2"],
  "relevantSubcategories": ["subcategory1", "subcategory2"],
  "productFeatures": ["feature1", "feature2"],
  "explanation": "Brief explanation of why these categories match the query"
}

Return ONLY the JSON object, nothing else.
`;
    
    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini analysis:', text);
    
    // Parse the JSON response
    let analysisResult;
    try {
      // Extract JSON from the response (in case there's any extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      // Fallback to default recommendations
      return getDefaultRecommendations(limit);
    }
    
    // Match products based on the analysis
    let matchedProducts = [...products];
    
    // Filter by categories if available
    if (analysisResult.relevantCategories && analysisResult.relevantCategories.length > 0) {
      matchedProducts = matchedProducts.filter(product => 
        analysisResult.relevantCategories.includes(product.category)
      );
    }
    
    // Further filter by subcategories if available
    if (analysisResult.relevantSubcategories && analysisResult.relevantSubcategories.length > 0) {
      matchedProducts = matchedProducts.filter(product => 
        analysisResult.relevantSubcategories.includes(product.subcategory)
      );
    }
    
    // If no matches found, use all products
    if (matchedProducts.length === 0) {
      matchedProducts = products;
    }
    
    // Filter by product features if available
    if (analysisResult.productFeatures && analysisResult.productFeatures.length > 0) {
      // Create a score for each product based on how many features it matches
      const scoredProducts = matchedProducts.map(product => {
        const productText = `${product.name} ${product.description} ${product.category} ${product.subcategory}`.toLowerCase();
        
        // Count how many features match
        const matchCount = analysisResult.productFeatures.filter((feature: string) => 
          productText.includes(feature.toLowerCase())
        ).length;
        
        return {
          product,
          score: matchCount
        };
      });
      
      // Sort by score (highest first)
      scoredProducts.sort((a, b) => b.score - a.score);
      
      // Extract just the products
      matchedProducts = scoredProducts.map(item => item.product);
    }
    
    // Sort by rating as a secondary criterion
    matchedProducts.sort((a, b) => b.rating - a.rating);
    
    // Limit the number of products
    return matchedProducts.slice(0, limit);
  } catch (error) {
    console.error('Error getting dynamic recommendations:', error);
    return getDefaultRecommendations(limit);
  }
};

/**
 * Get default recommendations (top-rated products)
 * @param limit - Maximum number of products to return
 * @returns Array of top-rated products
 */
const getDefaultRecommendations = (limit: number = 10): Product[] => {
  console.log('Getting default recommendations');
  return [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};