const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const adminSupabase = createClient(supabaseUrl, serviceKey);

async function run() {
  const email = `test-${crypto.randomBytes(4).toString('hex')}@bazl.com`;
  const password = 'password123';
  
  console.log('Signing up user:', email);
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Test User' }
  });

  if (authError) {
    console.error('Signup error:', authError);
    return;
  }

  const userId = authData.user.id;
  console.log('User signed up. ID:', userId);

  // Check if profile exists
  const { data: profile, error: profileError } = await adminSupabase.from('profiles').select('*').eq('id', userId).single();
  
  if (profileError) {
    console.error('Profile not found after signup! Trigger is likely broken:', profileError);
    // Let's try to manually insert to see the error
    const { error: manualError } = await adminSupabase.from('profiles').insert({
      id: userId,
      full_name: 'Test User'
    });
    console.error('Manual insert without role error:', manualError);
  } else {
    console.log('Profile automatically created!:', profile);
  }

  // Attempt to add to cart
  console.log('Creating cart for user...');
  const { data: cart, error: cartError } = await adminSupabase.from('carts').insert({ buyer_id: userId }).select().single();
  
  if (cartError) {
    console.error('Error inserting cart:', cartError);
  } else {
    console.log('Cart created successfully!', cart);
  }
}

run();
