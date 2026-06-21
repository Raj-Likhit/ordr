const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // We can't directly query pg_class via PostgREST easily, but we can query the REST API for OpenAPI spec 
  // or just run a query that might fail.
  // Instead, let's just query profiles for a single record to see what columns come back.
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Profiles columns:', Object.keys(data[0] || {}));
  }

  // Also query carts
  const { data: carts, error: cartsError } = await supabase.from('carts').select('*').limit(1);
  if (cartsError) {
    console.error('Error fetching carts:', cartsError);
  } else {
    console.log('Carts columns:', Object.keys(carts[0] || {}));
  }
}

run();
