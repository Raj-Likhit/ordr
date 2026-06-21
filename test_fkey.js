const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const query = `
    SELECT
      tc.table_schema, 
      tc.constraint_name, 
      tc.table_name, 
      kcu.column_name, 
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='carts';
  `;
  
  const { data, error } = await supabase.rpc('execute_sql_not_exist', { query });
  console.log(data, error);
  // Actually we can't run raw SQL like this easily. Let's just insert a fake cart.
  const { data: insertData, error: insertError } = await supabase.from('carts').insert({ buyer_id: '0df6e905-b5af-406b-83ed-aaf4b2bd740d' }).select();
  console.log('Cart insert:', insertError || insertData);
    console.log('Sample address ID:', addrs[0].id);
    
    // Now let's try to insert a fake order with this address to see the EXACT error
    const fakeOrder = {
      buyer_id: '0df6e905-b5af-406b-83ed-aaf4b2bd740d',
      address_id: addrs[0].id,
      total_amount: 100,
      payment_status: 'pending'
    };
    
    const { data: insertData, error: insertError } = await supabase.from('orders').insert(fakeOrder).select().single();
    if(insertError) {
      console.error('Order insert error:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('Order inserted successfully with address_id!');
    }
  }
}

run();
