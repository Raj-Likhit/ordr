import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const brainDir = 'C:\\Users\\rajli\\.gemini\\antigravity\\brain\\b52b50d1-8c06-48b1-8a8d-bd492936483f';
const targetDir = 'public/assets/seed';

const mappings = [
  { src: 'merino_wool_beanie_1781921611572.png', dest: 'merino_wool_beanie.png' },
  { src: 'linen_button_down_shirt_1781921514821.png', dest: 'linen_button_down_shirt.png' },
  { src: 'organic_cotton_t_shirt_1781921501022.png', dest: 'organic_cotton_t_shirt.png' },
  { src: 'vegan_leather_backpack_1781921570918.png', dest: 'vegan_leather_backpack.png' },
  { src: 'titanium_cuff_bracelet_1781921527186.png', dest: 'titanium_cuff_bracelet.png' },
  { src: 'bamboo_bath_mat_1781921540506.png', dest: 'bamboo_bath_mat.png' },
  { src: 'aromatherapy_diffuser_1781921554122.png', dest: 'aromatherapy_diffuser.png' },
  { src: 'geometric_table_clock_1781921597241.png', dest: 'geometric_table_clock.png' },
  { src: 'minimalist_desk_lamp_1781921582687.png', dest: 'minimalist_desk_lamp.png' }
];

async function run() {
  console.log("Copying files...");
  for (const m of mappings) {
    const srcPath = path.join(brainDir, m.src);
    const destPath = path.join(targetDir, m.dest);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${m.src} -> ${m.dest}`);
    } else {
      console.error(`Source file not found: ${srcPath}`);
    }
  }

  console.log("\nUpdating Supabase database product_images URLs...");
  const { data: images, error } = await supabase.from('product_images').select('*');
  if (error) {
    console.error("Error reading images from Supabase:", error.message);
    return;
  }

  let updateCount = 0;
  for (const img of images) {
    if (img.url.endsWith('.svg')) {
      const filename = path.basename(img.url, '.svg');
      const hasMapping = mappings.some(m => m.dest === `${filename}.png`);
      if (hasMapping) {
        const newUrl = img.url.replace('.svg', '.png');
        console.log(`Updating DB URL: ${img.url} -> ${newUrl}`);
        const { error: updateErr } = await supabase
          .from('product_images')
          .update({ url: newUrl })
          .eq('id', img.id);
        if (updateErr) {
          console.error(`Error updating image ${img.id}:`, updateErr.message);
        } else {
          updateCount++;
        }
      }
    }
  }

  console.log(`\nSuccessfully updated ${updateCount} image records in Supabase!`);
}

run().catch(console.error);
