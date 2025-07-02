// Test script for Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

// Import dotenv to load environment variables
import dotenv from 'dotenv';
dotenv.config();

// API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Validate API key
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is missing in environment variables');
  process.exit(1);
}

// Initialize the API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API...');
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Generate content
    const prompt = "What are the best fertilizers for wheat crops?";
    console.log('Sending prompt:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\nResponse from Gemini API:');
    console.log('------------------------');
    console.log(text);
    console.log('------------------------');
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error testing Gemini API:', error);
  }
}

// Run the test
testGeminiAPI();
