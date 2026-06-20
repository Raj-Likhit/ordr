import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Please set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const curatedProducts = [
  {
    cat: 'clothing',
    title: "Handwoven Linen Shirt",
    description: "An effortless, breathable handwoven linen shirt. Perfect for relaxed, elegant styling.",
    price: 3200,
    image: "https://images.unsplash.com/photo-1598554889165-8139a49f2883?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'home-decor',
    title: "Brass Pendant Lamp",
    description: "A striking brushed brass pendant lamp that adds a warm, industrial glow to any room.",
    price: 8500,
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'home-decor',
    title: "Artisan Ceramic Mug",
    description: "Hand-thrown on the wheel, this unique ceramic mug is glazed in natural earth tones.",
    price: 950,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'wellness',
    title: "Organic Lavender Soap",
    description: "Cold-pressed organic soap infused with pure lavender essential oil and dried buds.",
    price: 450,
    image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'home-decor',
    title: "Woven Rattan Basket",
    description: "A sturdy, hand-woven rattan basket ideal for storage or as a rustic planter.",
    price: 1800,
    image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'jewelry',
    title: "Minimalist Leather Wallet",
    description: "Sleek, full-grain leather cardholder wallet featuring a slim, minimalist profile.",
    price: 1500,
    image: "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'home-decor',
    title: "Matte Black French Press",
    description: "A sleek, double-walled stainless steel French press finished in a modern matte black.",
    price: 3500,
    image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'home-decor',
    title: "Olive Wood Cutting Board",
    description: "A rich, naturally patterned cutting and serving board carved from Mediterranean olive wood.",
    price: 2800,
    image: "https://images.unsplash.com/photo-1597348989645-46b190ce4918?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'home-decor',
    title: "Terracotta Plant Pot",
    description: "Classic terracotta planter with drainage, perfect for your favorite indoor botanicals.",
    price: 700,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'wellness',
    title: "Rose Quartz Face Roller",
    description: "A natural rose quartz facial roller designed to soothe skin and promote circulation.",
    price: 1200,
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'home-decor',
    title: "Linen Throw Pillow",
    description: "Organic French linen throw pillow in natural flax color, featuring a subtle fringe.",
    price: 850,
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'jewelry',
    title: "Hammered Brass Hoop Earrings",
    description: "Lightweight and versatile, these hammered brass hoops bring an earthy elegance.",
    price: 600,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'jewelry',
    title: "Raw Quartz Pendant Necklace",
    description: "A delicate gold-filled chain featuring a raw, unpolished clear quartz crystal.",
    price: 1100,
    image: "https://images.unsplash.com/photo-1599643478524-fb66f70a00ea?auto=format&fit=crop&q=80&w=800"
  }
];

async function wipeData() {
  console.log("Cleaning slate: deleting old order items...");
  await supabase.from('order_items').delete().gt('quantity', -1);
  
  console.log("Deleting sub orders...");
  await supabase.from('sub_orders').delete().neq('status', 'nonexistent');
  
  console.log("Deleting orders...");
  await supabase.from('orders').delete().gt('total_amount', -1);
  
  console.log("Deleting product images...");
  await supabase.from('product_images').delete().gt('sort_order', -1);
  
  console.log("Deleting product variants...");
  await supabase.from('product_variants').delete().gt('stock', -1);
  
  console.log("Deleting products...");
  await supabase.from('products').delete().neq('slug', 'nonexistent');
}

async function seedCurated() {
  console.log("Starting curated seed script...");
  console.log(`Connecting to: ${SUPABASE_URL}`);

  await wipeData();

  // Create categories if missing
  const requiredCategories = ['clothing', 'home-decor', 'jewelry', 'wellness'];
  for (const catSlug of requiredCategories) {
    const { data: existingCat } = await supabase.from('categories').select('*').eq('slug', catSlug).maybeSingle();
    if (!existingCat) {
      console.log(`Creating missing category: ${catSlug}`);
      await supabase.from('categories').insert({ name: catSlug.charAt(0).toUpperCase() + catSlug.slice(1).replace('-', ' '), slug: catSlug });
    }
  }

  // 1. Fetch categories
  const { data: categories, error: catErr } = await supabase.from('categories').select('*');
  if (catErr) throw catErr;

  // 2. Fetch vendors
  let { data: vendors, error: vendorErr } = await supabase.from('vendor_profiles').select('*');
  if (vendorErr || !vendors || vendors.length === 0) {
    console.error("No vendors found. Please ensure vendors are seeded via npm run seed first.");
    process.exit(1);
  }

  let createdCount = 0;
  for (const item of curatedProducts) {
    let category = categories.find(c => c.slug === item.cat);
    if (!category) {
       category = categories[0];
    }
    
    // Pick random vendor
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];

    const slug = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${crypto.randomBytes(4).toString('hex')}`;

    const productData = {
      vendor_id: vendor.id,
      category_id: category.id,
      title: item.title,
      slug: slug,
      description: item.description,
      base_price: item.price,
      is_active: true
    };
    
    const { data: pData, error: pErr } = await supabase.from('products').insert(productData).select().single();
    if (pErr) {
       console.error(`Error inserting product ${item.title}:`, pErr);
       continue;
    }

    // Insert variant
    const variantData = {
      product_id: pData.id,
      stock: Math.floor(Math.random() * 50) + 10,
      sku: `SKU-${crypto.randomBytes(4).toString('hex')}`
    };
    const { error: vErr } = await supabase.from('product_variants').insert(variantData);
    if (vErr) console.error("Error inserting variant", vErr);

    // Insert image
    const imageData = {
      product_id: pData.id,
      url: item.image,
      sort_order: 0
    };
    const { error: imgErr } = await supabase.from('product_images').insert(imageData);
    if (imgErr) console.error("Error inserting image", imgErr);

    console.log(`Created highly curated product: ${item.title}`);
    createdCount++;
  }

  console.log(`Successfully created ${createdCount} beautifully curated products! Storefront is ready.`);
}

seedCurated().catch(console.error);
