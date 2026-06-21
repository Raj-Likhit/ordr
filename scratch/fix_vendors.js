require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  console.log("Fetching profiles for vendors...");
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').eq('role', 'vendor');
  if (pError) return console.error(pError);
  console.log("Vendor Profiles in users table:", profiles);

  console.log("\nFetching vendor_profiles...");
  const { data: vendorProfiles, error: vpError } = await supabase.from('vendor_profiles').select('*');
  if (vpError) return console.error(vpError);
  console.log("Vendor Profiles table:", vendorProfiles);

  console.log("\nFetching products distribution...");
  const { data: products, error: prodError } = await supabase.from('products').select('id, title, vendor_id');
  if (prodError) return console.error(prodError);
  
  const dist = {};
  for (const p of products) {
    dist[p.vendor_id] = (dist[p.vendor_id] || 0) + 1;
  }
  console.log("Products per vendor:", dist);
}

check();
