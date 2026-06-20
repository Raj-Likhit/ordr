import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const emails = [
  'buyer@ordr.test', 'vendor@ordr.test', 'vendor2@ordr.test', 'admin@ordr.test',
  'buyer1@ordr.com', 'buyer1@example.com', 'admin@ordr.com', 'vendor@ordr.com'
];
const passwords = ['password123', 'buyer123456', 'vendor123456', 'admin123456', '123456'];

async function run() {
  for (const email of emails) {
    for (const password of passwords) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (data?.user) {
        console.log(`\n\x1b[32mSUCCESS: ${email} / ${password}\x1b[0m\n`);
        return;
      }
    }
  }
  console.log('None worked.');
}

run();
