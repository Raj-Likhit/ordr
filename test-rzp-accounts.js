require('dotenv').config({ path: '.env.local' });
const Razorpay = require('razorpay');

async function testAccounts() {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    const accountPayload = {
      name: "Test Account Holder",
      email: "testvendor@ordr.com",
      tnc_accepted: true,
      account_details: {
        business_name: "Test Store",
        business_type: "individual"
      },
      bank_account: {
        ifsc_code: "HDFC0001234",
        account_number: "1234567890",
        beneficiary_name: "Test Account Holder"
      }
    };

    console.log("Calling accounts.create...");
    const account = await razorpay.accounts.create(accountPayload);
    console.log('SUCCESS! Created account:', account.id);
  } catch (err) {
    console.error('ERROR:', err);
  }
}

testAccounts();
