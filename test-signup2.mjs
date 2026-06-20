import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ptjwzwakkystqxzapvgw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0and6d2Fra3lzdHF4emFwdmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTY2NTcsImV4cCI6MjA5NzI3MjY1N30.hq0s4JMYmVzvo9Tdmmre5JvBdmy9V9zOQV5_ZNuzA4U';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  const { data, error } = await supabase.auth.signUp({
    email: 'buyer1@ordr.com',
    password: 'password123',
    options: {
      data: { full_name: 'Buyer One' }
    }
  });
  console.log('Data:', data.user?.id);
  console.log('Error:', error);
}

testSignup();
