const fs = require('fs');
const products = JSON.parse(fs.readFileSync('products_dump.json'));

const studioAellaKeywords = [
  'Tech', 'Stand', 'Keyboard', 'Mouse', 'Display', 'Wireless', 'Earbuds', 'Charg', 
  'SSD', 'Drive', 'Smart', 'Thermostat', 'Reader', 'Laptop', 'Wallet', 'Backpack',
  'Clock', 'Desk Lamp', 'French Press', 'Vase', 'Concrete', 'Minimalist', 'Pendant Lamp',
  'Watch', 'Bag', 'Speaker'
];

let aella = [];
let artisan = [];

for (const p of products) {
  let isAella = false;
  for (const k of studioAellaKeywords) {
    if (p.title.toLowerCase().includes(k.toLowerCase()) || (p.category && p.category.toLowerCase().includes('tech'))) {
      isAella = true;
      break;
    }
  }
  
  if (isAella) {
    aella.push(p);
  } else {
    artisan.push(p);
  }
}

console.log(`Aella: ${aella.length}, Artisan: ${artisan.length}`);
if (aella.length <= 25 && artisan.length <= 25) {
    console.log("Aella Titles:", aella.map(p => p.title));
    console.log("Artisan Titles:", artisan.map(p => p.title));
}
