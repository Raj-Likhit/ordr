require('dotenv').config({ path: '.env.local' });
const Razorpay = require('razorpay');

async function testKeys() {
  try {
    console.log("Key ID:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.substring(0, 8) + '...');
    const rzp = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    // Create a tiny test order to verify keys
    const order = await rzp.orders.create({
      amount: 100, // 1 INR
      currency: 'INR',
      receipt: 'test_receipt_' + Date.now()
    });
    console.log('SUCCESS! Created test order:', order.id);
  } catch (err) {
    console.error('ERROR:', err);
  }
}

testKeys();
