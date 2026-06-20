import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, title, slug, base_price, rating_avg, rating_count,
      vendor:vendor_profiles ( business_name ),
      images:product_images ( url )
    `)
    .limit(4);
    
  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

run();
