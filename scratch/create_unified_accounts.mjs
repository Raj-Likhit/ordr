import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is not defined in .env.local!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const accounts = [
  {
    email: 'buyer@ordr.com',
    password: 'buyer123456',
    fullName: 'Arjun Kumar',
    role: 'buyer'
  },
  {
    email: 'vendor1@ordr.com',
    password: 'vendor123456',
    fullName: 'Priya Sharma',
    role: 'vendor',
    businessName: 'Studio Aella'
  },
  {
    email: 'vendor2@ordr.com',
    password: 'vendor123456',
    fullName: 'Rahul Mehta',
    role: 'vendor',
    businessName: 'Artisan Hands'
  },
  {
    email: 'admin@ordr.com',
    password: 'admin123456',
    fullName: 'Admin User',
    role: 'admin'
  }
];

async function createAccount(acc) {
  console.log(`Checking/Creating user: ${acc.email} (${acc.role})...`);

  // Check if user already exists in auth.users by trying to log in or list users?
  // We can just try to create it, if it exists, it will return an error or we can update it.
  const { data, error } = await supabase.auth.admin.createUser({
    email: acc.email,
    password: acc.password,
    email_confirm: true,
    user_metadata: { full_name: acc.fullName }
  });

  let userId;
  if (error) {
    if (error.message.includes('already exists') || error.message.includes('already registered')) {
      console.log(`User ${acc.email} already exists in Auth. Fetching existing user...`);
      // Since we don't have direct listUsers filter, we can update it or fetch it.
      // But we can just update password to be sure it matches.
      const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
      if (listErr) {
        console.error("Error listing users:", listErr.message);
        return;
      }
      const existingUser = listData.users.find(u => u.email === acc.email);
      if (!existingUser) {
        console.error(`Could not find user ${acc.email} in list.`);
        return;
      }
      userId = existingUser.id;
      // Update password to match
      await supabase.auth.admin.updateUserById(userId, { password: acc.password, email_confirm: true });
    } else {
      console.error(`Error creating auth user ${acc.email}:`, error.message);
      return;
    }
  } else {
    userId = data.user.id;
    console.log(`Created auth user: ${userId}`);
  }

  // Create or Update Profile
  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: userId,
    role: acc.role,
    full_name: acc.fullName
  });

  if (profileErr) {
    console.error(`Error upserting profile for ${acc.email}:`, profileErr.message);
  } else {
    console.log(`Upserted profile for ${acc.email}`);
  }

  // Create or Update Vendor Profile if vendor
  if (acc.role === 'vendor') {
    const { error: vendorErr } = await supabase.from('vendor_profiles').upsert({
      id: userId,
      business_name: acc.businessName,
      status: 'approved'
    });

    if (vendorErr) {
      console.error(`Error upserting vendor profile for ${acc.email}:`, vendorErr.message);
    } else {
      console.log(`Upserted vendor profile for ${acc.email}`);
    }
  }
}

async function run() {
  for (const acc of accounts) {
    await createAccount(acc);
  }
  console.log("\nAll uniform test accounts have been created/updated and auto-verified!");
}

run().catch(console.error);
