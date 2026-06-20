import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('get_tables'); // Or just fetch lists of tables
  // Let's query information_schema via a select if we can?
  // Supabase JS doesn't expose arbitrary select on information_schema directly unless exposed.
  // Let's check if we can query 'addresses' and 'user_addresses'.
  const { data: addrs, error: err1 } = await supabase.from('addresses').select('*').limit(1);
  const { data: uaddrs, error: err2 } = await supabase.from('user_addresses').select('*').limit(1);
  
  console.log("addresses query:", { success: !err1, error: err1?.message });
  console.log("user_addresses query:", { success: !err2, error: err2?.message });
}

run();
