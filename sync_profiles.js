const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  console.log('Fetching auth users...');
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }

  console.log(`Found ${users.length} users in auth.users.`);

  console.log('Fetching profiles...');
  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id');
  
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return;
  }

  const profileIds = new Set(profiles.map(p => p.id));
  console.log(`Found ${profileIds.size} profiles.`);

  const missingUsers = users.filter(u => !profileIds.has(u.id));
  console.log(`Found ${missingUsers.length} users missing profiles.`);

  for (const user of missingUsers) {
    console.log(`Attempting to insert profile for user ${user.id} (${user.email || user.phone})`);
    
    const profileData = {
      id: user.id,
      full_name: user.user_metadata?.full_name || 'Anonymous User',
      role: 'buyer' // adding default role just in case it's required
    };

    const { error: insertError } = await supabase.from('profiles').insert(profileData);
    
    if (insertError) {
      console.error(`Failed to insert profile for ${user.id}:`, insertError.message);
      
      // Try again without role
      const fallbackData = { id: user.id, full_name: user.user_metadata?.full_name || 'Anonymous User' };
      const { error: fallbackError } = await supabase.from('profiles').insert(fallbackData);
      if (fallbackError) {
        console.error(`Fallback insert failed:`, fallbackError.message);
      } else {
        console.log(`Fallback insert succeeded for ${user.id}`);
      }
    } else {
      console.log(`Successfully created profile for ${user.id}`);
    }
  }
}

run();
