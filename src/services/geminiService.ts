/**
 * Gemini AI Service
 * Uses the official Google Generative AI SDK with the Gemini 2.5 Pro Preview model
 * Implements structured output for product recommendations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// API key
const GEMINI_API_KEY = '***REMOVED***';

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Use the correct model name as identified by Google
const MODEL_NAME = 'gemini-2.5-pro-exp-03-25';

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

// Fallback responses for common agricultural queries
const FALLBACK_RESPONSES: Record<string, GeminiResponse> = {
  'fertilizer': {
    answer: "For wheat crops, the best fertilizers typically include nitrogen-rich options like urea or ammonium nitrate, as wheat is a heavy nitrogen feeder. Phosphorus and potassium are also important. A balanced NPK fertilizer with ratios like 20-10-10 is often recommended during the growing season. Always soil test before application to determine specific needs for your field.",
    productRecommendations: [
      {
        productId: "fert-001",
        productName: "WheatBoost NPK 20-10-10",
        reason: "Balanced nutrition specifically formulated for wheat crops"
      },
      {
        productId: "fert-002",
        productName: "UltraGrow Nitrogen Plus",
        reason: "High nitrogen content ideal for wheat's vegetative growth stage"
      }
    ]
  },
  'pest': {
    answer: "Common pests affecting wheat crops include aphids, armyworms, and wheat stem sawfly. Integrated pest management (IPM) approaches are recommended, combining biological controls, crop rotation, and targeted pesticide applications when necessary. Regular field monitoring is essential for early detection.",
    productRecommendations: [
      {
        productId: "pest-001",
        productName: "NaturalGuard Aphid Control",
        reason: "Effective against common wheat aphids while being eco-friendly"
      },
      {
        productId: "pest-002",
        productName: "CropShield Insecticide",
        reason: "Broad-spectrum protection against multiple wheat pests"
      }
    ]
  },
  'water': {
    answer: "Wheat typically requires about 12-15 inches of water throughout its growing season. The most critical irrigation periods are during tillering, stem extension, and grain filling stages. Over-watering can increase disease pressure, while under-watering during critical growth stages can significantly reduce yield.",
    productRecommendations: [
      {
        productId: "irr-001",
        productName: "SmartDrip Irrigation System",
        reason: "Water-efficient irrigation solution ideal for wheat fields"
      },
      {
        productId: "irr-002",
        productName: "SoilMoist Retention Granules",
        reason: "Helps retain soil moisture during critical growth stages"
      }
    ]
  },
  'crop': {
    answer: "When selecting wheat varieties, consider factors like disease resistance, climate adaptation, end-use quality, and yield potential. Popular varieties include hard red winter wheat, soft white winter wheat, and hard red spring wheat, each suited to different growing conditions and market purposes.",
    productRecommendations: [
      {
        productId: "seed-001",
        productName: "Premium Hard Red Winter Wheat Seeds",
        reason: "High-yielding variety with excellent disease resistance"
      },
      {
        productId: "seed-002",
        productName: "Organic Soft White Wheat Seeds",
        reason: "Perfect for organic farming with good drought tolerance"
      }
    ]
  },
  'soil': {
    answer: "Wheat grows best in well-drained loamy soils with a pH between 6.0 and 7.0. Soil preparation should include proper tillage to create a firm seedbed. Regular soil testing is recommended to monitor nutrient levels and adjust fertility programs accordingly.",
    productRecommendations: [
      {
        productId: "soil-001",
        productName: "SoilRight pH Balancer",
        reason: "Adjusts soil pH to the optimal range for wheat growth"
      },
      {
        productId: "soil-002",
        productName: "MicroNutrient Soil Enhancer",
        reason: "Adds essential micronutrients often missing in depleted soils"
      }
    ]
  }
};

export const geminiService = {
  /**
   * Generate a response using Gemini AI with structured output for product recommendations
   * @param messages - Array of previous messages in the conversation
   * @returns The AI's response including product recommendations
   */
  generateResponse: async (messages: { role: string; content: string }[]): Promise<string> => {
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

    try {
      console.log('Sending to Gemini model:', MODEL_NAME);
      
      // Get the model with the correct name
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME
      });

      // Craft prompt for structured output
      const structuredPrompt = `
You are an expert agricultural assistant for CropsayAI. Provide a clear and concise answer to the user's question, and also include a section called "productRecommendations" that suggests 2-3 products tailored to the user's needs, based on the conversation history provided below. Format your entire response as valid JSON with the following keys:
{
  "answer": "<your natural language answer here>",
  "productRecommendations": [
      {"productId": "<generate a unique ID>", "productName": "<Product Name>", "reason": "<Why this product fits>"}
      // you must include 2-3 objects
  ]
}

User Question: ${userQuestion}
Chat History: ${recentChatHistory}

Remember to make your product recommendations specifically related to farming and agriculture products.
`;

      // Generate content with structured output
      console.log('Structured prompt:', structuredPrompt);
      const result = await model.generateContent(structuredPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini response received');
      
      if (!text || text.trim() === '') {
        console.error('Received empty response from Gemini');
        throw new Error('Empty response from Gemini API');
      }
      
      // Try to parse the response as JSON
      try {
        // Extract JSON from the response (it might be wrapped in code blocks)
        const jsonMatch = text.match(/```(?:json)?([\s\S]*?)```/) || 
                         text.match(/{[\s\S]*?}/);
                         
        const jsonText = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : text;
        const parsedResponse = JSON.parse(jsonText) as GeminiResponse;
        
        // Format the response for display in the chat
        let formattedResponse = parsedResponse.answer + "\n\n";
        
        if (parsedResponse.productRecommendations && 
            parsedResponse.productRecommendations.length > 0) {
          formattedResponse += "**Recommended Products:**\n\n";
          
          for (const product of parsedResponse.productRecommendations) {
            formattedResponse += `**${product.productName}**\n${product.reason}\n\n`;
          }
        }
        
        return formattedResponse;
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.log('Raw response:', text);
        
        // If can't parse, return the raw text as fallback
        return text;
      }
      
    } catch (error) {
      console.error('Error in Gemini API call:', error);
      
      // Use fallback responses based on keywords in the user's question
      const userQuestionLower = userQuestion.toLowerCase();
      
      // Check for keywords and return appropriate fallback responses
      for (const [keyword, response] of Object.entries(FALLBACK_RESPONSES)) {
        if (userQuestionLower.includes(keyword)) {
          console.log(`Using fallback response for keyword: ${keyword}`);
          
          // Format the fallback response like we would for a real API response
          let formattedResponse = response.answer + "\n\n";
          
          if (response.productRecommendations && 
              response.productRecommendations.length > 0) {
            formattedResponse += "**Recommended Products:**\n\n";
            
            for (const product of response.productRecommendations) {
              formattedResponse += `**${product.productName}**\n${product.reason}\n\n`;
            }
          }
          
          return formattedResponse;
        }
      }
      
      // If no specific fallback matches, check if it's about crops in general
      if (userQuestionLower.includes('wheat') || 
          userQuestionLower.includes('farm') || 
          userQuestionLower.includes('grow') || 
          userQuestionLower.includes('plant')) {
        const generalResponse: GeminiResponse = {
          answer: "As an agriculture assistant, I can tell you that successful farming depends on many factors including climate, soil conditions, water availability, and proper management practices. For specific crops like wheat, it's important to choose varieties adapted to your region, prepare soil properly, plant at the optimal time, and monitor for pests and diseases throughout the growing season.",
          productRecommendations: [
            {
              productId: "gen-001",
              productName: "Complete Farming Guide eBook",
              reason: "Comprehensive resource covering all aspects of wheat farming"
            },
            {
              productId: "gen-002",
              productName: "Soil Testing Kit",
              reason: "Essential tool for evaluating your soil before planting"
            }
          ]
        };
        
        let formattedResponse = generalResponse.answer + "\n\n";
        formattedResponse += "**Recommended Products:**\n\n";
        
        for (const product of generalResponse.productRecommendations) {
          formattedResponse += `**${product.productName}**\n${product.reason}\n\n`;
        }
        
        return formattedResponse;
      }
      
      return "I'm sorry, I encountered an issue generating a response. Please try again or contact support if the problem persists.";
    }
  },

  /**
   * Generate a title for a chat session based on the first message
   * @param message - The first user message in the chat
   * @returns A generated title for the chat
   */
  generateChatTitle: async (message: string): Promise<string> => {
    try {
      // Get the model with the correct name
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME
      });
      
      const prompt = `Create a very short title (3-5 words) for a chat conversation that starts with this message: "${message}"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const title = response.text().replace(/["']/g, '').trim();
      
      if (title && title.length > 0) {
        return title;
      } else {
        // Fallback to simple title extraction
        const words = message.split(' ').slice(0, 3).join(' ');
        return words + (message.split(' ').length > 3 ? '...' : '');
      }
    } catch (error) {
      console.error('Error generating chat title:', error);
      // Simple fallback
      const words = message.split(' ').slice(0, 3).join(' ');
      return words + (message.split(' ').length > 3 ? '...' : '');
    }
  }
};
