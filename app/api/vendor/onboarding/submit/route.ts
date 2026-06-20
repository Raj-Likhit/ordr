import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Basic Validation
    if (body.gstin && !GSTIN_REGEX.test(body.gstin)) {
      return NextResponse.json({ error: 'Invalid GSTIN format' }, { status: 400 });
    }
    if (body.pan_number && !PAN_REGEX.test(body.pan_number)) {
      return NextResponse.json({ error: 'Invalid PAN format' }, { status: 400 });
    }
    if (body.bank_ifsc && !IFSC_REGEX.test(body.bank_ifsc)) {
      return NextResponse.json({ error: 'Invalid IFSC format' }, { status: 400 });
    }

    const dbEncryptionKey = process.env.DATABASE_ENCRYPTION_KEY || 'default_secret_key_123';

    // Encrypt bank account number
    let encryptedBankAccount = null;
    if (body.bank_account_no) {
      const { data: encrypted, error: encryptError } = await supabase.rpc('encrypt_value', {
        val: body.bank_account_no,
        secret: dbEncryptionKey
      });
      if (encryptError) throw encryptError;
      encryptedBankAccount = encrypted;
    }

    // Update vendor profile
    const updatePayload = {
      gstin: body.gstin,
      bank_account_number: encryptedBankAccount, // Updated column name from previous schema
      bank_ifsc: body.bank_ifsc,
      bank_account_holder: body.account_holder, // Using correct column name
      upi_id: body.upi_id || null,
      status: 'under_review',
      submitted_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('vendor_profiles')
      .update(updatePayload)
      .eq('id', user.id);

    if (updateError) {
      console.error("DB Update Error:", updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Vendor Submit Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
