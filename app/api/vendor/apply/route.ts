import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Check if profile exists
    const { data: existing } = await supabase
      .from('vendor_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    const payload = {
      id: user.id,
      business_name: body.storeName,
      description: body.storeDescription,
      gstin: body.gstin,
      bank_account_holder: body.accountName,
      bank_account_number: body.accountNumber,
      bank_ifsc: body.ifsc,
      status: 'pending'
    };

    let error;
    if (existing) {
      const { error: updateError } = await supabase
        .from('vendor_profiles')
        .update(payload)
        .eq('id', user.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('vendor_profiles')
        .insert(payload);
      error = insertError;
    }

    if (error) {
      console.error('Vendor apply error:', error);
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Vendor apply error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
