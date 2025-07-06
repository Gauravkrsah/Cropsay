// Direct test of Khalti API
import axios from 'axios';

const KHALTI_SECRET_KEY = 'fb72e11e14004dd4ba652bb211a7d506';

async function testKhaltiDirect() {
  try {
    console.log('Testing Khalti API directly...');
    console.log('Using secret key:', KHALTI_SECRET_KEY.substring(0, 10) + '...');
    
    const payload = {
      return_url: 'http://localhost:3000/payment/success',
      website_url: 'http://localhost:3000',
      amount: 1000, // 10 NPR in paisa
      purchase_order_id: 'test_' + Date.now(),
      purchase_order_name: 'Test Order',
      customer_info: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '9800000000'
      }
    };
    
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/initiate/',
      payload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('Success! Response:', response.data);
  } catch (error) {
    console.error('Error details:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testKhaltiDirect();
