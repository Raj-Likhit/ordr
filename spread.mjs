import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const newVendors = [
  { name: 'Kala Weavers', email: 'kala@ordr.com' },
  { name: 'The Brass Collective', email: 'brass@ordr.com' },
  { name: 'Indigo Heritage', email: 'indigo@ordr.com' },
  { name: 'Earth & Loom', email: 'earthloom@ordr.com' }
];

async function spread() {
  console.log("Creating vendors...");
  for (const v of newVendors) {
    // Check if user exists
    const { data: existingProfiles } = await supabase.from('profiles').select('*').eq('full_name', v.name);
    if (existingProfiles && existingProfiles.length > 0) {
      console.log(`Vendor ${v.name} already exists.`);
      continue;
    }

    const { data: authData, error: userError } = await supabase.auth.signUp({
      email: v.email,
      password: 'password123',
      options: {
        data: { full_name: v.name }
      }
    });
    
    if (userError) {
      console.log("Error creating user", v.email, userError);
      continue;
    }

    // Auth signup might not return a fully confirmed user depending on settings,
    // but in Ordr typically email confirmations are disabled for dev or it auto-confirms
    const userId = authData.user.id;

    // profile is likely auto-created by triggers, let's update it to 'vendor'
    const { error: profileError } = await supabase.from('profiles').update({ role: 'vendor' }).eq('id', userId);
    if (profileError) {
       console.log("Error updating profile role for", v.name, profileError);
    }
    
    const vProfile = { id: userId, business_name: v.name, status: 'approved' };
    const { error: vError } = await supabase.from('vendor_profiles').insert(vProfile);
    if (vError) {
       console.log("Error inserting vendor profile for", v.name, vError);
    } else {
       console.log(`Created vendor: ${v.name}`);
    }
  }

  console.log("Fetching vendors...");
  const { data: vendors, error: vErr } = await supabase.from('vendor_profiles').select('*');
  if (vErr) throw vErr;
  
  console.log(`Found ${vendors.length} vendors.`);

  console.log("Fetching products...");
  const { data: products, error: pErr } = await supabase.from('products').select('*');
  if (pErr) throw pErr;

  console.log(`Found ${products.length} products. Distributing among vendors...`);

  let count = 0;
  for (const p of products) {
    const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
    const { error } = await supabase.from('products').update({ vendor_id: randomVendor.id }).eq('id', p.id);
    if (error) {
      console.error(`Failed to update product ${p.id}:`, error);
    } else {
      count++;
    }
  }
  console.log(`Successfully updated ${count} products with random vendors.`);
}

spread().catch(console.error);
