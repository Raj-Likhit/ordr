const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const userId = '00261263-9e30-421f-804c-29f642411766'; // One of the test users from earlier
  
  const addressData = {
    user_id: userId,
    full_name: 'Test Name',
    address_line1: '123 Test St',
    city: 'Test City',
    state: 'TS',
    pincode: '123456',
    is_default_shipping: false,
    is_default_billing: false
  };

  console.log('Attempting to insert address...');
  const { data, error } = await supabase.from('user_addresses').insert(addressData).select().single();
  
  if (error) {
    console.error('Insert error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('Inserted:', data);
  }
}

run();
