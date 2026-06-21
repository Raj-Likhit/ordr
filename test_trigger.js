const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminSupabase = createClient(supabaseUrl, serviceKey);

async function run() {
  const email = `trigger-test-${crypto.randomBytes(4).toString('hex')}@bazl.com`;
  console.log('Testing signup with email:', email);

  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
    user_metadata: { full_name: 'Trigger Test User' }
  });

  if (authError) {
    console.error('Signup error:', authError);
    return;
  }

  const userId = authData.user.id;
  console.log('User signed up. ID:', userId);

  // Wait a second for trigger to complete
  await new Promise(res => setTimeout(res, 1000));

  const { data: profile, error: profileError } = await adminSupabase.from('profiles').select('*').eq('id', userId).single();
  
  if (profileError) {
    console.error('Trigger STILL broken! Profile not found:', profileError.message);
    
    // Simulate what the trigger does to see the Postgres error
    console.log('Simulating trigger insert...');
    const { error: manualError } = await adminSupabase.from('profiles').insert({
      id: userId,
      full_name: 'Trigger Test User',
      role: 'buyer'
    });
    
    if (manualError) {
      console.error('Postgres error inside trigger:', JSON.stringify(manualError, null, 2));
    } else {
      console.log('Manual insert succeeded! This means the trigger FUNCTION is broken, not the schema constraints.');
    }
  } else {
    console.log('SUCCESS! Profile created automatically by trigger:', profile);
    
    // Test cart insert just to be 100% sure
    const { error: cartError } = await adminSupabase.from('carts').insert({ buyer_id: userId }).select().single();
    if (cartError) {
      console.error('Cart error:', cartError);
    } else {
      console.log('Cart successfully inserted!');
    }
  }
}

run();
