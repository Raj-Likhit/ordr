const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminSupabase = createClient(supabaseUrl, serviceKey);

async function run() {
  const { data: usersData, error: usersError } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }
  
  const authUsers = usersData.users;
  console.log(`Found ${authUsers.length} users in auth.users`);
  
  const { data: profiles, error: profilesError } = await adminSupabase.from('profiles').select('id');
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return;
  }
  console.log(`Found ${profiles.length} profiles`);
  
  const profileIds = new Set(profiles.map(p => p.id));
  const missingProfiles = authUsers.filter(u => !profileIds.has(u.id));
  
  console.log(`There are ${missingProfiles.length} missing profiles.`);
  
  if (missingProfiles.length > 0) {
    console.log('Fixing them now...');
    for (const u of missingProfiles) {
      const { error } = await adminSupabase.from('profiles').insert({
        id: u.id,
        role: 'buyer',
        full_name: u.user_metadata?.full_name || 'Anonymous'
      });
      if (error) {
        console.error(`Error fixing user ${u.id}:`, error.message);
      } else {
        console.log(`Fixed user ${u.id}`);
      }
    }
  }
}

run();
