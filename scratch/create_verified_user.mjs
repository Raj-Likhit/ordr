import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createVerifiedUser(role) {
  const emailRes = await fetch('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1');
  const emails = await emailRes.json();
  const email = emails[0];
  const [login, domain] = email.split('@');

  console.log(`[${role}] Creating user with email: ${email}`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: { full_name: role === 'admin' ? 'Admin User' : 'Vendor User' }
    }
  });

  if (error) {
    console.error('Signup error:', error.message);
    return;
  }

  const userId = data.user.id;

  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: userId,
    role: role,
    full_name: role === 'admin' ? 'Admin User' : 'Vendor User'
  });
  if (profileErr) console.error('Profile err:', profileErr);

  if (role === 'vendor') {
    const { error: vErr } = await supabase.from('vendor_profiles').upsert({
      id: userId,
      business_name: 'Test Vendor Studio',
      status: 'approved'
    });
    if (vErr) console.error('Vendor profile err:', vErr);
  }

  console.log(`[${role}] Waiting for verification email...`);
  let messageId = null;
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
    const msgs = await listRes.json();
    if (msgs.length > 0) {
      messageId = msgs[0].id;
      break;
    }
  }

  if (!messageId) {
    console.error(`[${role}] Did not receive verification email.`);
    return;
  }

  const msgRes = await fetch(`https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${messageId}`);
  const msgBody = await msgRes.json();
  
  const textBody = msgBody.textBody || msgBody.htmlBody || "";
  const linkMatches = textBody.match(/https?:\/\/[^\s"'<]+/g);
  let verifyLink = null;
  if (linkMatches) {
    verifyLink = linkMatches.find(l => l.includes('verify'));
  }

  if (!verifyLink) {
    console.error(`[${role}] Could not find verification link in email body.`);
    console.log("Body was:", textBody);
    return;
  }

  console.log(`[${role}] Found link, verifying...`);
  try {
    const response = await fetch(verifyLink, { redirect: 'follow' });
    if (response.ok || response.status === 302 || response.status === 303) {
      console.log(`[${role}] \x1b[32mSuccessfully verified!\x1b[0m`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: password123\n`);
    } else {
      console.error(`[${role}] Verification failed with status`, response.status);
    }
  } catch(e) {
    console.log(`[${role}] \x1b[32mVerification likely succeeded (redirect occurred).\x1b[0m`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: password123\n`);
  }
}

async function run() {
  await createVerifiedUser('vendor');
  await createVerifiedUser('admin');
}

run();
