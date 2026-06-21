require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const vendor1Id = 'eeb24744-bdda-4c49-9b6c-5021a1c2328f'; // Artisan Hands
const vendor2Id = '5ebd7ed3-4422-4d95-a111-45c9ae7b386d'; // Studio Aella

const studioAellaKeywords = [
  'Tech', 'Stand', 'Keyboard', 'Mouse', 'Display', 'Wireless', 'Earbuds', 'Charg', 
  'SSD', 'Drive', 'Smart', 'Thermostat', 'Reader', 'Laptop', 'Wallet', 'Backpack',
  'Clock', 'Desk Lamp', 'French Press', 'Vase', 'Concrete', 'Minimalist', 'Pendant Lamp',
  'Watch', 'Bag', 'Speaker'
];

async function fix() {
  console.log("Renaming vendor 2 to Studio Aella...");
  await supabase.from('profiles').update({ full_name: 'Studio Aella' }).eq('id', vendor2Id);
  await supabase.from('vendor_profiles').update({ business_name: 'Studio Aella' }).eq('id', vendor2Id);

  console.log("Fetching products...");
  const { data: products, error } = await supabase.from('products').select('id, title');
  if (error) return console.error(error);

  let aellaProducts = [];
  let artisanProducts = [];

  for (const p of products) {
    let isAella = false;
    for (const k of studioAellaKeywords) {
      if (p.title.toLowerCase().includes(k.toLowerCase())) {
        isAella = true;
        break;
      }
    }
    if (isAella) {
      aellaProducts.push(p);
    } else {
      artisanProducts.push(p);
    }
  }

  console.log(`Classified: Aella=${aellaProducts.length}, Artisan=${artisanProducts.length}`);

  // Moving Aella products to vendor2Id
  console.log("Moving Aella products to vendor2...");
  const aellaIds = aellaProducts.map(p => p.id);
  const artisanIds = artisanProducts.map(p => p.id);

  if (aellaIds.length > 0) {
    const { error: err1 } = await supabase.from('products').update({ vendor_id: vendor2Id }).in('id', aellaIds);
    if (err1) console.error("Error moving Aella:", err1);
  }
  
  if (artisanIds.length > 0) {
    const { error: err2 } = await supabase.from('products').update({ vendor_id: vendor1Id }).in('id', artisanIds);
    if (err2) console.error("Error moving Artisan:", err2);
  }

  console.log("Done.");
}

fix();
