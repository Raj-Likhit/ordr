import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("Fetching vendors...");
  
  const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
  if (userErr) {
    console.error("Error listing users:", userErr.message);
    return;
  }

  const v1 = users.users.find(u => u.email === 'vendor1@ordr.com');
  const v2 = users.users.find(u => u.email === 'vendor2@ordr.com');

  if (!v1 || !v2) {
    console.error("vendor1@ordr.com or vendor2@ordr.com not found!");
    return;
  }

  console.log(`vendor1 id: ${v1.id}`);
  console.log(`vendor2 id: ${v2.id}`);

  console.log("Fetching all products...");
  const { data: products, error: prodErr } = await supabase.from('products').select('id');
  if (prodErr) {
    console.error("Error fetching products:", prodErr.message);
    return;
  }

  console.log(`Found ${products.length} products. Re-assigning...`);

  let assignedV1 = 0;
  let assignedV2 = 0;

  for (let i = 0; i < products.length; i++) {
    const targetVendorId = i % 2 === 0 ? v1.id : v2.id;
    const { error: updateErr } = await supabase
      .from('products')
      .update({ vendor_id: targetVendorId })
      .eq('id', products[i].id);

    if (updateErr) {
      console.error(`Error updating product ${products[i].id}:`, updateErr.message);
    } else {
      if (targetVendorId === v1.id) assignedV1++;
      else assignedV2++;
    }
  }

  console.log(`Successfully re-assigned products:`);
  console.log(`  vendor1@ordr.com owns: ${assignedV1} products`);
  console.log(`  vendor2@ordr.com owns: ${assignedV2} products`);
}

run().catch(console.error);
