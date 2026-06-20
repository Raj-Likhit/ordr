const Razorpay = require('razorpay');
const instance = new Razorpay({ key_id: 'rzp_test_123', key_secret: '123' });
console.log(Object.keys(instance));
