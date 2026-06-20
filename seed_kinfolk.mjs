import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Fallback for local dev if set

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Please set SUPABASE_SERVICE_ROLE_KEY environment variable.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const kinfolkProducts = [
  {
    "cat": "home-decor",
    "title": "Hand-Thrown Ceramic Vase",
    "description": "A minimal, unglazed ceramic vase perfect for dried florals. Handcrafted by local artisans.",
    "price": 1200,
    "image": "/assets/seed/ceramic_vase_1781763114163.png"
  },
  {
    "cat": "home-decor",
    "title": "Linen Throw Pillow",
    "description": "Organic French linen throw pillow in natural flax color, featuring a subtle fringe.",
    "price": 850,
    "image": "/assets/seed/linen_pillow_1781763125756.png"
  },
  {
    "cat": "home-decor",
    "title": "Hand-Carved Olive Wood Bowl",
    "description": "A deeply textured olive wood serving bowl, naturally finished with beeswax.",
    "price": 2500,
    "image": "/assets/seed/olive_bowl_1781763140390.png"
  },
  {
    "cat": "jewelry",
    "title": "Hammered Brass Hoop Earrings",
    "description": "Lightweight and versatile, these hammered brass hoops bring an earthy elegance to any outfit.",
    "price": 600,
    "image": "/assets/seed/brass_hoops_1781763153227.png"
  },
  {
    "cat": "jewelry",
    "title": "Raw Quartz Pendant Necklace",
    "description": "A delicate gold-filled chain featuring a raw, unpolished clear quartz crystal.",
    "price": 1100,
    "image": "/assets/seed/quartz_necklace_1781763165439.png"
  },
  {
    "cat": "jewelry",
    "title": "Silver Stacking Rings",
    "description": "Set of three slim sterling silver stacking rings with a brushed matte finish.",
    "price": 900,
    "image": "/assets/seed/silver_rings_1781763186477.png"
  },
  {
    "cat": "wellness",
    "title": "Sandalwood & Vetiver Incense Cones",
    "description": "Hand-rolled incense cones made from pure sandalwood powder and vetiver essential oil.",
    "price": 400,
    "image": "/assets/seed/incense_cones_1781763199103.png"
  },
  {
    "cat": "wellness",
    "title": "Botanic Bath Salts",
    "description": "A calming blend of Epsom salts, Himalayan pink salt, dried rose petals, and lavender.",
    "price": 750,
    "image": "/assets/seed/bath_salts_1781763208931.png"
  },
  {
    "cat": "wellness",
    "title": "Organic Matcha Powder",
    "description": "Ceremonial grade organic matcha sourced directly from Uji, Japan.",
    "price": 1800,
    "image": "/assets/seed/matcha_powder_1781763220109.png"
  },
  {
    "cat": "textiles",
    "title": "Hand-Woven Cotton Throw",
    "description": "A soft, breathable cotton throw blanket woven on traditional handlooms.",
    "price": 3200,
    "image": "/assets/seed/cotton_throw_1781763231875.png"
  },
  {
    "cat": "textiles",
    "title": "Block Printed Napkin Set",
    "description": "Set of four organic cotton napkins featuring subtle botanical block prints.",
    "price": 1000,
    "image": "/assets/seed/napkin_set_1781763253742.png"
  },
  {
    "cat": "textiles",
    "title": "Indigo Dyed Table Runner",
    "description": "A beautiful linen table runner dyed naturally with organic indigo.",
    "price": 1500,
    "image": "/assets/seed/table_runner_1781763265707.png"
  },
  {
    "cat": "home-decor",
    "title": "Beeswax Taper Candles",
    "description": "Pair of hand-dipped taper candles made from 100% pure, natural beeswax.",
    "price": 450,
    "image": "/assets/seed/taper_candles_1781763278891.png"
  },
  {
    "cat": "home-decor",
    "title": "Terracotta Planter",
    "description": "A simple, rustic terracotta planter with a built-in drainage saucer.",
    "price": 800,
    "image": "/assets/seed/terracotta_planter_1781763297487.png"
  },
  {
    "cat": "wellness",
    "title": "Cedarwood Essential Oil",
    "description": "Grounding and woody essential oil, perfect for diffusing in your living space.",
    "price": 650,
    "image": "/assets/seed/cedarwood_oil_1781763307631.png"
  },
  {
    "cat": "textiles",
    "title": "Muslin Swaddle Blanket",
    "description": "An ultra-soft organic cotton muslin blanket, gentle enough for everyday use.",
    "price": 950,
    "image": "/assets/seed/swaddle_blanket_1781763327295.png"
  },
  {
    "cat": "tech",
    "title": "Minimalist Wireless Earbuds",
    "description": "Minimalist wireless earbuds in a sleek matte charging case.",
    "price": 1500,
    "image": "/assets/seed/wireless_earbuds_1781763338489.png"
  },
  {
    "cat": "tech",
    "title": "Matte Black Mechanical Keyboard",
    "description": "A matte black mechanical keyboard with minimal, clean keycaps.",
    "price": 2200,
    "image": "/assets/seed/matte_black_mechanical_keyboard.svg"
  },
  {
    "cat": "tech",
    "title": "Aluminum Laptop Stand",
    "description": "A sleek, minimalist aluminum laptop stand.",
    "price": 850,
    "image": "/assets/seed/aluminum_laptop_stand.svg"
  },
  {
    "cat": "tech",
    "title": "Wireless Charging Pad",
    "description": "A slim, wireless charging pad made of matte stone.",
    "price": 600,
    "image": "/assets/seed/wireless_charging_pad.svg"
  },
  {
    "cat": "tech",
    "title": "Smart Thermostat",
    "description": "Minimalist smart thermostat with an e-ink display.",
    "price": 2500,
    "image": "/assets/seed/smart_thermostat.svg"
  },
  {
    "cat": "tech",
    "title": "E-Ink Reader",
    "description": "Lightweight digital reader with a glare-free e-ink screen.",
    "price": 1800,
    "image": "/assets/seed/e_ink_reader.svg"
  },
  {
    "cat": "tech",
    "title": "Portable SSD Drive",
    "description": "Ultra-fast 1TB portable SSD in an aluminum enclosure.",
    "price": 1600,
    "image": "/assets/seed/portable_ssd_drive.svg"
  },
  {
    "cat": "tech",
    "title": "Minimalist Desk Lamp",
    "description": "Adjustable LED desk lamp with a matte finish.",
    "price": 1200,
    "image": "/assets/seed/minimalist_desk_lamp.svg"
  },
  {
    "cat": "apparel",
    "title": "Merino Wool Beanie",
    "description": "Soft, breathable merino wool beanie for everyday wear.",
    "price": 450,
    "image": "/assets/seed/merino_wool_beanie.svg"
  },
  {
    "cat": "apparel",
    "title": "Organic Cotton T-Shirt",
    "description": "Classic fit t-shirt made from 100% organic cotton.",
    "price": 350,
    "image": "/assets/seed/organic_cotton_t_shirt.svg"
  },
  {
    "cat": "apparel",
    "title": "Linen Button-Down Shirt",
    "description": "Lightweight linen shirt perfect for warm weather.",
    "price": 800,
    "image": "/assets/seed/linen_button_down_shirt.svg"
  },
  {
    "cat": "apparel",
    "title": "Cashmere Scarf",
    "description": "Luxuriously soft cashmere scarf with frayed edges.",
    "price": 1200,
    "image": "/assets/seed/cashmere_scarf.svg"
  },
  {
    "cat": "home-decor",
    "title": "Concrete Bookends",
    "description": "Solid concrete bookends with a brutalist architectural form.",
    "price": 650,
    "image": "/assets/seed/concrete_bookends.svg"
  },
  {
    "cat": "home-decor",
    "title": "Geometric Table Clock",
    "description": "Silent, sweeping table clock in a sharp geometric shape.",
    "price": 900,
    "image": "/assets/seed/geometric_table_clock.svg"
  },
  {
    "cat": "wellness",
    "title": "Aromatherapy Diffuser",
    "description": "Ceramic ultrasonic diffuser for essential oils.",
    "price": 1100,
    "image": "/assets/seed/aromatherapy_diffuser.svg"
  },
  {
    "cat": "wellness",
    "title": "Bamboo Bath Mat",
    "description": "Water-resistant bamboo bath mat with a slatted design.",
    "price": 550,
    "image": "/assets/seed/bamboo_bath_mat.svg"
  },
  {
    "cat": "jewelry",
    "title": "Titanium Cuff Bracelet",
    "description": "A lightweight, brushed titanium cuff bracelet.",
    "price": 1400,
    "image": "/assets/seed/titanium_cuff_bracelet.svg"
  },
  {
    "cat": "apparel",
    "title": "Vegan Leather Backpack",
    "description": "Minimalist backpack made from durable vegan leather.",
    "price": 1800,
    "image": "/assets/seed/vegan_leather_backpack.svg"
  }
];

async function seedKinfolk() {
  console.log("Starting kinfolk seed...");
  
  // 1. Fetch categories
  const { data: categories, error: catErr } = await supabase.from('categories').select('*');
  if (catErr) throw catErr;

  // 2. Fetch vendors
  const { data: vendors, error: vendorErr } = await supabase.from('vendor_profiles').select('*');
  if (vendorErr || !vendors || vendors.length === 0) {
    console.error("Please run the initial seed.mjs first so vendors exist.");
    process.exit(1);
  }

  console.log(`Found ${vendors.length} vendors and ${categories.length} categories.`);

  let createdCount = 0;
  for (const item of kinfolkProducts) {
    // Find matching category
    let category = categories.find(c => c.slug === item.cat);
    if (!category) {
       // fallback to first if not found
       category = categories[0];
    }
    
    // Pick random vendor
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];

    const slug = `${item.title.toLowerCase().replace(/\s+/g, '-')}-${crypto.randomBytes(4).toString('hex')}`;

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
       console.error("Error inserting product", pErr);
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

    createdCount++;
  }

  console.log(`Successfully created ${createdCount} kinfolk products with images and variants!`);
}

seedKinfolk().catch(console.error);
