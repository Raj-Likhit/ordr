require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testOnboard() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Logging in as vendor...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'testvendor@ordr.com',
    password: 'password123'
  });

  if (error) {
    console.error("Login failed:", error.message);
    return;
  }

  const token = data.session.access_token;
  console.log("Logged in! Calling API...");

  const res = await fetch('http://localhost:3000/api/vendor/razorpay-onboard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      'Cookie': 'sb-' + new URL(supabaseUrl).hostname.split('.')[0] + '-auth-token=' + JSON.stringify([{ access_token: token }])
    },
    body: JSON.stringify({
      bank_account_holder: 'Test Vendor',
      bank_account_number: '1234567890',
      bank_ifsc: 'HDFC0001234',
      business_name: 'Test Business',
      email: 'testvendor@ordr.com'
    })
  });

  const json = await res.json();
  console.log("API Response:", res.status, json);
}

testOnboard();
