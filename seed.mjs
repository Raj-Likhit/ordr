import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Please set SUPABASE_SERVICE_ROLE_KEY environment variable.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const vendors = [
  { name: 'Kala Weavers', email: 'kala@example.com' },
  { name: 'The Brass Collective', email: 'brass@example.com' },
  { name: 'Indigo Heritage', email: 'indigo@example.com' },
  { name: 'Earth & Loom', email: 'earthloom@example.com' },
  { name: 'Copper & Clay Studio', email: 'copperclay@example.com' },
  { name: 'Silk Route Artisans', email: 'silkroute@example.com' },
  { name: 'Veda Naturals', email: 'veda@example.com' },
  { name: 'Terracotta Tales', email: 'terracotta@example.com' },
  { name: 'The Woodcraft Guild', email: 'woodcraft@example.com' },
  { name: 'Saffron & Spice Co.', email: 'saffron@example.com' }
];

const buyers = Array.from({ length: 20 }).map((_, i) => ({
  name: `Buyer ${i + 1}`,
  email: `buyer${i + 1}@example.com`
}));

const categories = [
  { name: 'Home Decor', slug: 'home-decor' },
  { name: 'Textiles', slug: 'textiles' },
  { name: 'Jewelry', slug: 'jewelry' },
  { name: 'Wellness', slug: 'wellness' },
  { name: 'Tech', slug: 'tech' },
  { name: 'Apparel', slug: 'apparel' }
];

const premiumAdjectives = ['Hand-spun', 'Hammered', 'Artisanal', 'Vintage', 'Organic', 'Hand-painted', 'Carved', 'Pure', 'Authentic', 'Traditional'];
const productNouns = ['Vase', 'Scarf', 'Incense', 'Rug', 'Earrings', 'Necklace', 'Cushion', 'Saree', 'Bowl', 'Lamp'];

async function seed() {
  console.log("Starting seed...");

  // 1. Create Categories
  console.log("Creating categories...");
  const catResult = await supabase.from('categories').insert(categories).select();
  if (catResult.error) throw catResult.error;
  const createdCategories = catResult.data;

  // 2. Create Vendors
  console.log("Creating vendors...");
  const vendorProfiles = [];
  for (const v of vendors) {
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: v.email,
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: v.name }
    });
    if (userError) throw userError;

    const profile = { id: user.user.id, role: 'vendor', full_name: v.name };
    await supabase.from('profiles').insert(profile);
    
    const vProfile = { id: user.user.id, business_name: v.name, status: 'approved' };
    await supabase.from('vendor_profiles').insert(vProfile);
    
    vendorProfiles.push({ id: user.user.id, ...v });
  }

  // 3. Create Buyers
  console.log("Creating buyers...");
  const buyerProfiles = [];
  for (const b of buyers) {
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: b.email,
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: b.name }
    });
    if (userError) throw userError;

    const profile = { id: user.user.id, role: 'buyer', full_name: b.name };
    await supabase.from('profiles').insert(profile);

    const address = {
      buyer_id: user.user.id,
      label: 'Home',
      line1: '123 Test St',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      is_default: true
    };
    const { data: addr } = await supabase.from('addresses').insert(address).select().single();

    buyerProfiles.push({ id: user.user.id, addressId: addr.id, ...b });
  }

  // 4. Create Products (50)
  console.log("Creating products...");
  const createdProducts = [];
  const createdVariants = [];
  for (let i = 0; i < 50; i++) {
    const vendor = vendorProfiles[i % vendorProfiles.length];
    const category = createdCategories[i % createdCategories.length];
    const adj = premiumAdjectives[Math.floor(Math.random() * premiumAdjectives.length)];
    const noun = productNouns[Math.floor(Math.random() * productNouns.length)];
    const title = `${adj} ${noun} ${i}`;
    const base_price = Math.floor(Math.random() * 5000) + 500;

    const product = {
      vendor_id: vendor.id,
      category_id: category.id,
      title: title,
      slug: `product-${i}-${crypto.randomBytes(4).toString('hex')}`,
      description: `A premium quality ${title.toLowerCase()} crafted with care.`,
      base_price: base_price,
      is_active: true
    };
    
    const { data: pData, error: pErr } = await supabase.from('products').insert(product).select().single();
    if (pErr) throw pErr;
    createdProducts.push(pData);

    // Create a variant
    const variant = {
      product_id: pData.id,
      stock: 10,
      sku: `SKU-${crypto.randomBytes(4).toString('hex')}`
    };
    const { data: vData, error: vErr } = await supabase.from('product_variants').insert(variant).select().single();
    if (vErr) throw vErr;
    createdVariants.push(vData);
  }

  // 5. Create Orders (15)
  console.log("Creating orders...");
  for (let i = 0; i < 15; i++) {
    const buyer = buyerProfiles[i % buyerProfiles.length];
    const variant = createdVariants[Math.floor(Math.random() * createdVariants.length)];
    const product = createdProducts.find(p => p.id === variant.product_id);
    const qty = Math.floor(Math.random() * 3) + 1;
    const totalAmount = product.base_price * qty;

    const order = {
      buyer_id: buyer.id,
      address_id: buyer.addressId,
      total_amount: totalAmount,
      payment_status: 'paid'
    };
    const { data: oData, error: oErr } = await supabase.from('orders').insert(order).select().single();
    if (oErr) throw oErr;

    const subOrder = {
      order_id: oData.id,
      vendor_id: product.vendor_id,
      status: 'confirmed',
      subtotal: totalAmount
    };
    const { data: soData, error: soErr } = await supabase.from('sub_orders').insert(subOrder).select().single();
    if (soErr) throw soErr;

    const orderItem = {
      sub_order_id: soData.id,
      variant_id: variant.id,
      quantity: qty,
      unit_price: product.base_price,
      gst_amount: product.base_price * qty * 0.18
    };
    const { error: oiErr } = await supabase.from('order_items').insert(orderItem);
    if (oiErr) throw oiErr;
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
