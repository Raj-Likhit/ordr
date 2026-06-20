import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkColumns(tableName, cols) {
  console.log(`Checking columns for ${tableName}...`);
  for (const col of cols) {
    const { error } = await supabase.from(tableName).select(col).limit(1);
    if (error) {
      console.log(`  Column '${col}': ❌ (${error.message})`);
    } else {
      console.log(`  Column '${col}': ✅`);
    }
  }
}

async function run() {
  await checkColumns('user_addresses', ['id', 'user_id', 'buyer_id', 'full_name', 'phone', 'address_line1', 'city', 'state', 'pincode', 'is_default_shipping']);
  await checkColumns('addresses', ['id', 'buyer_id', 'label', 'line1', 'line2', 'city', 'state', 'pincode', 'is_default']);
}

run();
