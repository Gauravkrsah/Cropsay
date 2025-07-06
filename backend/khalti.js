import express from 'express';
import axios from 'axios';

const router = express.Router();

// Health check endpoint
router.get('/khalti/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'OK',
    message: 'Khalti backend is running',
    timestamp: new Date().toISOString(),
    secretKeyConfigured: KHALTI_SECRET_KEY && KHALTI_SECRET_KEY.length > 10,
    secretKeyPrefix: KHALTI_SECRET_KEY.substring(0, 10) + '...'
  });
});

// Test endpoint that doesn't call external API
router.post('/khalti/test', (req, res) => {
  console.log('Test endpoint called with body:', req.body);
  res.json({
    status: 'OK',
    message: 'Backend is receiving requests',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Use environment variable or fallback to live key
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || 'fb72e11e14004dd4ba652bb211a7d506';

// Check if we have a valid secret key
const isValidSecretKey = KHALTI_SECRET_KEY && KHALTI_SECRET_KEY.length > 10;

// POST /api/khalti/initiate
router.post('/khalti/initiate', async (req, res) => {
  console.log('Khalti initiate request received');
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  // Log the secret key being used (first 10 characters for security)
  console.log('Using Khalti secret key:', KHALTI_SECRET_KEY.substring(0, 10) + '...');

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
    console.log('Using secret key:', KHALTI_SECRET_KEY.substring(0, 10) + '...');

    // Try sandbox endpoint first to test
    const apiEndpoint = KHALTI_SECRET_KEY.startsWith('test_')
      ? 'https://dev.khalti.com/api/v2/epayment/initiate/'
      : 'https://a.khalti.com/api/v2/epayment/initiate/';

    console.log('Using API endpoint:', apiEndpoint);

    const khaltiRes = await axios.post(
      apiEndpoint,
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

  } catch (err) {
    console.error('Khalti initiate error:', err.response?.data || err.message);

    const errorResponse = {
      error: {
        detail: err.response?.data?.detail || err.response?.data?.message || err.message || 'Payment initiation failed',
        code: err.response?.status || 500,
        khalti_error: err.response?.data
      }
    };

    res.status(err.response?.status || 500).json(errorResponse);
  }
});

// POST /api/khalti/verify - for payment verification
router.post('/khalti/verify', async (req, res) => {
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

  } catch (err) {
    console.error('Khalti verify error:', err.response?.data || err.message);

    const errorResponse = {
      error: {
        detail: err.response?.data?.detail || err.message || 'Payment verification failed',
        code: err.response?.status || 500
      }
    };

    res.status(err.response?.status || 500).json(errorResponse);
  }
});

export default router;
