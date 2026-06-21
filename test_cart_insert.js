const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const buyerId = '00000000-0000-0000-0000-000000000000'; // Fake ID to trigger constraint
  console.log('Attempting to insert cart with fake buyer_id...');
  
  const { data, error } = await supabase.from('carts').insert({ buyer_id: buyerId }).select();
  
  if (error) {
    console.error('Error inserting cart:', error);
    // Print details if any
    console.log('Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('Cart inserted successfully:', data);
  }
}

run();
