/**
 * Gemini AI Service
 * Uses the official Google Generative AI SDK with the Gemini 2.5 Pro Preview model
 * Implements structured output for product recommendations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerateContentStreamResult } from '@google/generative-ai';

// API key
const GEMINI_API_KEY = '***REMOVED***';

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Use the correct model name as identified by Google
const MODEL_NAME = 'gemini-1.5-flash'; // Using the free Gemini 1.5 Flash model
const RETRY_ATTEMPTS = 2; // Number of retry attempts if the API call fails

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

    try {
      // Direct API call
      console.log('Making direct API call to Gemini...');
      const model = genAI.getGenerativeModel({ 
        model: MODEL_NAME,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        }
      });
      
      const prompt = `
You are an expert agricultural assistant for CropsayAI. Answer the following question about farming, agriculture, or plants:

${userQuestion}

${recentChatHistory ? `Recent conversation context: ${recentChatHistory}` : ''}

Provide a helpful, informative response with practical advice.
`;
      
      // Check if streaming is requested
      if (onTokenReceived) {
        // Use streaming API
        const streamResult = await model.generateContentStream(prompt);
        let fullText = '';
        
        // Process the stream
        for await (const chunk of streamResult.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          
          // Call the callback with each chunk
          onTokenReceived(chunkText);
        }
        
        if (fullText && fullText.trim() !== '') {
          console.log('Successfully received streaming response from Gemini API');
          return fullText;
        }
        
        throw new Error('Empty streaming response from Gemini API');
      } else {
        // Use non-streaming API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        
      if (text && text.trim() !== '') {
          console.log('Successfully received response from Gemini API');
          return text;
        }
      
  
        throw new Error('Empty response from Gemini API');
      }
    } catch (error) {
      console.error('Error in Gemini API call:', error);
      
      // Instead of using fallback responses, return an error message
      // Try a direct API call as a last resort
      try {
        console.log('Attempting direct API call without structured output...');
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash' // Fallback to gemini-1.5-flash which is free
        });

        const simplePrompt = `
You are an expert agricultural assistant for CropsayAI. Answer the following question about farming, agriculture, or plants:

${userQuestion}

Provide a helpful, informative response with practical advice.
`;
        
        // Check if streaming is requested for fallback
        if (onTokenReceived) {
          const streamResult = await model.generateContentStream(simplePrompt);
          let fullText = '';
          
          // Process the stream
          for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            
            // Call the callback with each chunk
            onTokenReceived(chunkText);
          }
          
          if (fullText && fullText.trim() !== '') {
            return fullText;
          }
        } else {
          const result = await model.generateContent(simplePrompt);
          const response = await result.response;
          const text = response.text();
        
  
          if (text && text.trim() !== '') {
            return text;
          }
        }
      } catch (directError) {
        console.error('Direct API call also failed:', directError);
      }
      
      return "I'm sorry, I couldn't generate a response using the Gemini API. Please check your internet connection and try again.";
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
      const responseText = await result.response;
      const title = responseText.text().replace(/["']/g, '').trim();
      
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

/**
 * Helper function to generate a response from Gemini API with retry logic
 * @param userQuestion - The user's question
 * @param chatHistory - Recent chat history for context
 * @returns Formatted response from Gemini
 */
async function generateGeminiResponse(userQuestion: string, chatHistory: string): Promise<string> {
  let lastError: any = null;
  
  // Try multiple times in case of temporary API issues
  for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(`Sending to Gemini model (attempt ${attempt + 1}/${RETRY_ATTEMPTS + 1}):`, MODEL_NAME);
      
      // Get the model
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
Chat History: ${chatHistory}

Remember to make your product recommendations specifically related to farming and agriculture products.
`;

      // Generate content with structured output
      console.log('Structured prompt:', structuredPrompt);
      const result = await model.generateContent(structuredPrompt);
      const response = await result.response;
      let text = response.text();
      
      console.log('Gemini response received');
      
      if (!text || text.trim() === '') {
        console.error('Received empty response from Gemini');
        // If we're on the last attempt, throw an error
        if (attempt === RETRY_ATTEMPTS) {
          throw new Error('Empty response from Gemini API');
        }
        // Otherwise, try again
        continue;
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
      console.error(`Attempt ${attempt + 1}/${RETRY_ATTEMPTS + 1} failed:`, error);
      lastError = error;
      
      // If this is not the last attempt, wait a bit before retrying
      if (attempt < RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
        continue;
      }
    }
  }
  
  // If we've exhausted all retry attempts, throw the last error
  throw lastError || new Error('Failed to generate response from Gemini API after multiple attempts');
}
