import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptjwzwakkystqxzapvgw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0and6d2Fra3lzdHF4emFwdmd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5NjY1NywiZXhwIjoyMDk3MjcyNjU3fQ.jl89J05M6anx4HwqfC7NDZKUbxGs28dI2PXqESFWxMI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdd() {
  const buyerId = '36a9c396-9055-4c38-90f9-ecfb33cf59b0';
  const variantId = '49f458c5-f23d-4240-848b-04f284dab464';
  const quantity = 1;

  console.log('Testing addToCart logic...');

  // 1. findByBuyerId
  let { data: cart, error: cartError } = await supabase.from('carts').select('*').eq('buyer_id', buyerId).single();
  if (cartError && cartError.code !== 'PGRST116') {
    console.error('find error:', cartError);
    return;
  }
  console.log('Found cart:', cart?.id, cartError?.code);

  if (!cart) {
    console.log('Creating cart...');
    const { data: newCart, error: insertError } = await supabase.from('carts').insert({ buyer_id: buyerId }).select().single();
    if (insertError) {
      console.error('insert cart error:', insertError);
      return;
    }
    cart = newCart;
  }

  console.log('Cart to use:', cart.id);

  // 2. findItemByVariant
  const { data: existingItem, error: findItemError } = await supabase.from('cart_items').select('*').eq('cart_id', cart.id).eq('variant_id', variantId).single();
  if (findItemError && findItemError.code !== 'PGRST116') {
    console.error('find item error:', findItemError);
    return;
  }
  
  if (existingItem) {
    console.log('Updating item...');
    const { data: updated, error: updateError } = await supabase.from('cart_items').update({ quantity: existingItem.quantity + quantity }).eq('id', existingItem.id).select().single();
    if (updateError) console.error('update error:', updateError);
    else console.log('Successfully updated:', updated);
  } else {
    console.log('Adding new item...');
    const { data: added, error: addError } = await supabase.from('cart_items').insert({ cart_id: cart.id, variant_id: variantId, quantity }).select().single();
    if (addError) console.error('add error:', addError);
    else console.log('Successfully added:', added);
  }
}

testAdd();
