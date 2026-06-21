require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      payment_status,
      razorpay_order_id,
      created_at,
      address:user_addresses(address_line1, city, state, pincode),
      sub_orders(
        id,
        status,
        subtotal,
        tracking_id,
        vendor:vendor_profiles(business_name),
        order_items(id)
      )
    `)
    .eq('id', 'f5efc488-d594-4836-8057-ad8ad773b666');

  if (error) console.error("ERROR:", error);
  else console.log(JSON.stringify(data, null, 2));
}

test();
