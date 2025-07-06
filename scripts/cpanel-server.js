// Simplified server for cPanel deployment
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (React build)
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Gemini AI
let genAI = null;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log('✅ Gemini AI initialized');
} else {
  console.warn('⚠️ Gemini API key not found');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      frontend: 'running',
      gemini: genAI ? 'running' : 'disabled',
      khalti: 'integrated'
    }
  });
});

// Gemini AI endpoint
app.post('/api/generate', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({ error: 'Gemini AI service not available' });
    }

    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Khalti payment endpoints
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || 'fb72e11e14004dd4ba652bb211a7d506';

app.post('/api/khalti/initiate', async (req, res) => {
  console.log('Khalti initiate request received');
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  try {
    const {
      return_url,
      website_url,
      amount,
      purchase_order_id,
      purchase_order_name,
      customer_info
    } = req.body;

    // Validate required fields
    if (!amount || !purchase_order_id || !purchase_order_name || !customer_info) {
      return res.status(400).json({
        error: {
          detail: 'Missing required fields: amount, purchase_order_id, purchase_order_name, customer_info'
        }
      });
    }

    const payload = {
      return_url: return_url || `${req.protocol}://${req.get('host')}/payment/success`,
      website_url: website_url || `${req.protocol}://${req.get('host')}`,
      amount: parseInt(amount), // Ensure amount is integer
      purchase_order_id,
      purchase_order_name,
      customer_info: {
        name: customer_info.name || 'Customer',
        email: customer_info.email || 'customer@example.com',
        phone: customer_info.phone || '9800000000'
      }
    };

    console.log('Sending to Khalti:', JSON.stringify(payload, null, 2));

    const khaltiRes = await axios.post(
      'https://a.khalti.com/api/v2/epayment/initiate/',
      payload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log('Khalti response:', khaltiRes.data);
    res.json(khaltiRes.data);

  } catch (error) {
    console.error('Khalti initiation error:', error.response?.data || error.message);

    const errorResponse = {
      error: {
        detail: error.response?.data?.detail || error.response?.data?.message || error.message || 'Payment initiation failed',
        code: error.response?.status || 500,
        khalti_error: error.response?.data
      }
    };

    res.status(error.response?.status || 500).json(errorResponse);
  }
});

app.post('/api/khalti/verify', async (req, res) => {
  console.log('Khalti verify request:', req.body);

  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({
        error: { detail: 'Missing pidx parameter' }
      });
    }

    const khaltiRes = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('Khalti verify response:', khaltiRes.data);
    res.json(khaltiRes.data);

  } catch (error) {
    console.error('Khalti verify error:', error.response?.data || error.message);

    const errorResponse = {
      error: {
        detail: error.response?.data?.detail || error.message || 'Payment verification failed',
        code: error.response?.status || 500
      }
    };

    res.status(error.response?.status || 500).json(errorResponse);
  }
});

// API routes for frontend services
app.get('/api/products', (req, res) => {
  // Mock products endpoint - replace with actual Supabase integration
  res.json([
    {
      id: 1,
      name: 'Organic Fertilizer',
      price: 500,
      image: '/images/fertilizer.jpg',
      category: 'fertilizer'
    }
  ]);
});

app.get('/api/recommendations', (req, res) => {
  // Mock recommendations endpoint
  res.json([
    {
      id: 1,
      product_id: 1,
      reason: 'Best for your soil type',
      confidence: 0.85
    }
  ]);
});

// Handle React Router routes explicitly (for better SEO and debugging)
const reactRoutes = ['/shop', '/chat', '/learn', '/profile', '/orders', '/cart', '/payment'];
reactRoutes.forEach(route => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
});

// Handle common sub-routes without wildcards to avoid path-to-regexp issues
app.get('/shop/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/chat/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/profile/:section', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/orders/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all handler: send back React's index.html file for client-side routing
// This ensures that React Router handles all routes on the client side
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Serve index.html for all other routes (React Router will handle them)
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 CropsayAI server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});
