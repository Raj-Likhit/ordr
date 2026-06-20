import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: 'C:/Users/rajli/Downloads/Ordr/ordr/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const dir = 'C:/Users/rajli/Downloads/Ordr/ordr/public/images/products';
const bucketName = 'product-images';

async function run() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath);
    
    // Upload to bucket
    const { data, error } = await supabase.storage.from(bucketName).upload(file, content, {
      upsert: true,
      contentType: file.endsWith('.png') ? 'image/png' : 'image/jpeg'
    });
    
    if (error) {
      console.error(`Error uploading ${file}:`, error);
      continue;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(file);
    
    // Update DB
    const oldUrl = `/images/products/${file}`;
    const { error: dbError } = await supabase
      .from('product_images')
      .update({ url: publicUrl })
      .eq('url', oldUrl);
      
    if (dbError) {
      console.error(`Error updating DB for ${file}:`, dbError);
    } else {
      console.log(`Uploaded and updated: ${file} -> ${publicUrl}`);
    }
  }
}
run();
