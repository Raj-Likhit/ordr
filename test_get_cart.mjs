import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptjwzwakkystqxzapvgw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0and6d2Fra3lzdHF4emFwdmd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5NjY1NywiZXhwIjoyMDk3MjcyNjU3fQ.jl89J05M6anx4HwqfC7NDZKUbxGs28dI2PXqESFWxMI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGetCart() {
  const buyerId = '00261263-9e30-421f-804c-29f642411766'; // The new user

  console.log('Testing getCartWithItems...');

  let { data: cart, error: cartError } = await supabase.from('carts').select('id').eq('buyer_id', buyerId).single();
  
  if (cartError && cartError.code === 'PGRST116') {
    console.log('Multiple or zero carts found (PGRST116). Creating new cart...');
    const { data: newCart, error: insertError } = await supabase.from('carts').insert({ buyer_id: buyerId }).select('id').single();
    if (insertError) {
      console.error('Insert error:', insertError);
      return;
    }
    cart = newCart;
  } else if (cartError) {
    console.error('Cart error:', cartError);
    return;
  }

  console.log('Cart ID:', cart?.id);

  if (!cart) {
    console.log('No cart returned');
    return;
  }

  const { data: items, error: itemsError } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      variant_id,
      cart_id,
      variant:product_variants(
        id,
        size,
        color,
        price_override,
        product:products(
          id,
          title,
          slug,
          base_price,
          vendor:vendor_profiles(id, business_name),
          images:product_images(url)
        )
      )
    `)
    .eq('cart_id', cart.id);

  if (itemsError) {
    console.error('Items error:', itemsError);
    return;
  }

  console.log('Items:', items.length);
}

testGetCart();
