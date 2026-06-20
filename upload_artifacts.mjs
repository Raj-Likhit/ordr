import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: 'C:/Users/rajli/Downloads/Ordr/ordr/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const bucketName = 'product-images';

async function run() {
  // Ensure bucket exists
  const { data: bucket, error: bucketError } = await supabase.storage.getBucket(bucketName);
  if (bucketError && bucketError.message.includes('not found')) {
    console.log(`Creating bucket ${bucketName}...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    });
    if (createError) {
      console.error("Error creating bucket:", createError);
      return;
    }
  } else if (!bucket?.public) {
    await supabase.storage.updateBucket(bucketName, { public: true });
  }

  // Fetch all images that need uploading
  const { data: images, error: fetchError } = await supabase
    .from('product_images')
    .select('*')
    .like('url', 'file:///%');

  if (fetchError) {
    console.error("Error fetching images:", fetchError);
    return;
  }

  console.log(`Found ${images.length} images to upload.`);

  for (const img of images) {
    const localPathStr = img.url.replace('file:///', ''); // gets "C:/Users/..."
    
    // Some path cleanup just in case
    const localPath = decodeURIComponent(localPathStr).replace(/\\/g, '/');
    
    if (!fs.existsSync(localPath)) {
      console.error(`File not found: ${localPath}`);
      continue;
    }

    const content = fs.readFileSync(localPath);
    const fileName = path.basename(localPath);
    
    console.log(`Uploading ${fileName}...`);
    const { error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, content, {
      upsert: true,
      contentType: fileName.endsWith('.png') ? 'image/png' : 'image/jpeg'
    });
    
    if (uploadError) {
      console.error(`Error uploading ${fileName}:`, uploadError);
      continue;
    }
    
    const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    
    const { error: dbError } = await supabase
      .from('product_images')
      .update({ url: publicUrl })
      .eq('id', img.id);
      
    if (dbError) {
      console.error(`Error updating DB for ${fileName}:`, dbError);
    } else {
      console.log(`Uploaded and updated: ${fileName} -> ${publicUrl}`);
    }
  }
}

run();
