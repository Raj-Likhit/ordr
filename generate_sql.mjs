import fs from 'fs';
import crypto from 'crypto';

const vendorId = '65394098-49eb-46f7-9276-58658f10c049';
const categories = {
  'home-decor': 'ca0c2a73-8fe9-4378-a605-c95242703df8',
  'textiles': '8a0e3075-c8a9-4dfd-89a5-c602341df05f',
  'art': '92ced145-b00e-44a6-be6d-261bc54abce9',
  'jewelry': '3d27c6d8-0b24-4189-91dd-2b63e48921a7',
  'clothing': '53e3cf8f-7494-4655-99b7-eb8bee98116c',
  'wellness': '8a8c9a85-240e-49c6-bb8c-5d8c3b7548e4',
  'tech': 'ca0c2a73-8fe9-4378-a605-c95242703df8', // fallback to home-decor if tech isn't present
  'apparel': '53e3cf8f-7494-4655-99b7-eb8bee98116c' // fallback to clothing
};

// We will read seed_kinfolk.mjs and extract the kinfolkProducts array
const content = fs.readFileSync('./seed_kinfolk.mjs', 'utf-8');
const match = content.match(/const kinfolkProducts = (\[[\s\S]*?\]);/);
const kinfolkProducts = eval(match[1]);

let sql = `-- Massive Product Seeding Script\n\n`;

for (const item of kinfolkProducts) {
  const catId = categories[item.cat] || categories['home-decor'];
  const slug = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${crypto.randomBytes(4).toString('hex')}`;
  const productId = crypto.randomUUID();
  const variantId = crypto.randomUUID();
  const imageId = crypto.randomUUID();

  // Escape single quotes for SQL
  const safeTitle = item.title.replace(/'/g, "''");
  const safeDesc = item.description.replace(/'/g, "''");

  sql += `-- Product: ${safeTitle}\n`;
  sql += `INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('${productId}', '${vendorId}', '${catId}', '${safeTitle}', '${slug}', '${safeDesc}', ${item.price}, true);\n`;
  
  const stock = Math.floor(Math.random() * 50) + 10;
  const sku = `SKU-${crypto.randomBytes(4).toString('hex')}`;
  sql += `INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('${variantId}', '${productId}', ${stock}, '${sku}');\n`;

  sql += `INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('${imageId}', '${productId}', '${item.image}', 0);\n\n`;
}

fs.writeFileSync('./seed_products.sql', sql);
console.log("Generated seed_products.sql");
