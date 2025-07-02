import express from 'express';
import axios from 'axios';

const router = express.Router();

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || 'fb72e11e14004dd4ba652bb211a7d506'; // your sandbox live_secret_key

// POST /api/khalti/initiate
router.post('/khalti/initiate', async (req, res) => {
  console.log('Khalti initiate request body:', req.body); // DEBUG LOG
  try {
    const {
      return_url,
      website_url,
      amount,
      purchase_order_id,
      purchase_order_name,
      customer_info
    } = req.body;

    const payload = {
      return_url,
      website_url,
      amount,
      purchase_order_id,
      purchase_order_name,
      customer_info
    };

    const khaltiRes = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/initiate/',
      payload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(khaltiRes.data); // contains payment_url, pidx, etc.
  } catch (err) {
    res.status(400).json({ error: err.response?.data || err.message });
  }
});

export default router;
