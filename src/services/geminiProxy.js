// Simple Express server to proxy Gemini API requests (avoiding CORS issues)
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Gemini API key
const GEMINI_API_KEY = '***REMOVED***';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Endpoint to generate text
app.post('/api/generate', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log('Received request with message:', message);
    
    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Generate content
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    console.log('Generated response:', text);
    
    res.json({ response: text });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Gemini API proxy server running at http://localhost:${port}`);
});
