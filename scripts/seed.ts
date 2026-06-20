import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Use environment variables for remote Supabase if available, fallback to local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Please set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const kinfolkProducts = [
  // Home Decor
  {
    cat: 'home-decor',
    title: "Hand-Thrown Ceramic Vase",
    description: "A minimal, unglazed ceramic vase perfect for dried florals. Handcrafted by local artisans.",
    price: 1200,
    image: "https://images.unsplash.com/photo-1612152086884-2bdab70d74f2?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'home-decor',
    title: "Linen Throw Pillow",
    description: "Organic French linen throw pillow in natural flax color, featuring a subtle fringe.",
    price: 850,
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'home-decor',
    title: "Hand-Carved Olive Wood Bowl",
    description: "A deeply textured olive wood serving bowl, naturally finished with beeswax.",
    price: 2500,
    image: "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'home-decor',
    title: "Beeswax Taper Candles",
    description: "Pair of hand-dipped taper candles made from 100% pure, natural beeswax.",
    price: 450,
    image: "https://images.unsplash.com/photo-1602927807750-f80e608034db?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'home-decor',
    title: "Terracotta Planter",
    description: "A simple, rustic terracotta planter with a built-in drainage saucer.",
    price: 800,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800"
  },

  // Jewelry
  {
    cat: 'jewelry',
    title: "Hammered Brass Hoop Earrings",
    description: "Lightweight and versatile, these hammered brass hoops bring an earthy elegance to any outfit.",
    price: 600,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'jewelry',
    title: "Raw Quartz Pendant Necklace",
    description: "A delicate gold-filled chain featuring a raw, unpolished clear quartz crystal.",
    price: 1100,
    image: "https://images.unsplash.com/photo-1599643478524-fb66f70a00ea?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'jewelry',
    title: "Silver Stacking Rings",
    description: "Set of three slim sterling silver stacking rings with a brushed matte finish.",
    price: 900,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'jewelry',
    title: "Vintage Signet Ring",
    description: "A polished 14k gold vermeil signet ring featuring a classic, minimalist face.",
    price: 1500,
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'jewelry',
    title: "Freshwater Pearl Drop Earrings",
    description: "Elegant drop earrings featuring irregularly shaped baroque freshwater pearls.",
    price: 1250,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"
  },

  // Wellness
  {
    cat: 'wellness',
    title: "Sandalwood & Vetiver Incense Cones",
    description: "Hand-rolled incense cones made from pure sandalwood powder and vetiver essential oil.",
    price: 400,
    image: "https://images.unsplash.com/photo-1608691524310-75210c1f6e2f?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'wellness',
    title: "Botanic Bath Salts",
    description: "A calming blend of Epsom salts, Himalayan pink salt, dried rose petals, and lavender.",
    price: 750,
    image: "https://images.unsplash.com/photo-1615397323671-b0dbac75ecf2?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'wellness',
    title: "Organic Matcha Powder",
    description: "Ceremonial grade organic matcha sourced directly from Uji, Japan.",
    price: 1800,
    image: "https://images.unsplash.com/photo-1582787059124-74c0529d18e5?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'wellness',
    title: "Cedarwood Essential Oil",
    description: "Grounding and woody essential oil, perfect for diffusing in your living space.",
    price: 650,
    image: "https://images.unsplash.com/photo-1608528577891-eb0559ec5e29?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'wellness',
    title: "Exfoliating Dry Body Brush",
    description: "Natural bristle body brush for lymphatic drainage and smooth, glowing skin.",
    price: 550,
    image: "https://images.unsplash.com/photo-1616818165707-164e622b7201?auto=format&fit=crop&q=80&w=800"
  },

  // Clothing
  {
    cat: 'clothing',
    title: "Linen Wrap Dress",
    description: "An effortless, flowy wrap dress made from 100% European flax linen.",
    price: 3500,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'clothing',
    title: "Organic Cotton Relaxed Tee",
    description: "The perfect everyday t-shirt, sustainably made with incredibly soft organic cotton.",
    price: 1200,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'clothing',
    title: "Chunky Alpaca Knit Sweater",
    description: "Hand-knitted oversized sweater spun from exceptionally warm alpaca wool.",
    price: 4800,
    image: "https://images.unsplash.com/photo-1584306351025-2ab1eeb00645?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'clothing',
    title: "Washable Silk Camisole",
    description: "A luxurious, bias-cut silk camisole that drapes beautifully and is machine washable.",
    price: 2200,
    image: "https://images.unsplash.com/photo-1583391265517-35bbdad01209?auto=format&fit=crop&q=80&w=800"
  },
  {
    cat: 'clothing',
    title: "Wide Leg Twill Trousers",
    description: "High-waisted wide-leg trousers tailored from structured cotton twill.",
    price: 2900,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800"
  }
];

async function seedKinfolk() {
  console.log("Starting script seed...");
  console.log(`Connecting to: ${SUPABASE_URL}`);
  
  // Create 'Clothing' category if it doesn't exist
  const { data: existingClothingCat, error: findCatErr } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', 'clothing')
    .maybeSingle();

  if (findCatErr) {
    console.error("Error fetching clothing category", findCatErr);
  }

  if (!existingClothingCat) {
    console.log("Creating 'Clothing' category...");
    const { error: createCatErr } = await supabase.from('categories').insert({
      name: 'Clothing',
      slug: 'clothing'
    });
    if (createCatErr) {
       console.error("Failed to create Clothing category", createCatErr);
    }
  }

  // 1. Fetch categories
  const { data: categories, error: catErr } = await supabase.from('categories').select('*');
  if (catErr) throw catErr;

  // 2. Fetch vendors
  let { data: vendors, error: vendorErr } = await supabase.from('vendor_profiles').select('*');
  if (vendorErr || !vendors || vendors.length === 0) {
    console.error("No vendors found. Please ensure vendors are seeded.");
    process.exit(1);
  }

  console.log(`Found ${vendors.length} vendors and ${categories.length} categories.`);

  let createdCount = 0;
  for (const item of kinfolkProducts) {
    // Find matching category
    let category = categories.find(c => c.slug === item.cat);
    if (!category) {
       console.warn(`Category ${item.cat} not found, skipping ${item.title}`);
       continue;
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

    console.log(`Created product: ${item.title}`);
    createdCount++;
  }

  console.log(`Successfully created ${createdCount} kinfolk products with images and variants!`);
}

seedKinfolk().catch(console.error);
