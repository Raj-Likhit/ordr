import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { dispatchCommunication } from '@/lib/services/commService';

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    return null;
  }
  return user;
}

export async function GET() {
  const supabase = createClient();
  const user = await checkAdmin(supabase);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  
  // Get all vendor profiles with their associated user profiles
  const { data, error } = await supabase
    .from('vendor_profiles')
    .select(`
      *,
      profiles (
        full_name,
        phone,
        email,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const user = await checkAdmin(supabase);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { vendorId, status, reason } = await request.json();

    if (!vendorId || !status) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from('vendor_profiles')
      .update({ 
        status, 
        rejection_reason: reason || null,
        admin_notes: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', vendorId)
      .select('*, profiles(email, phone)')
      .single();

    if (error) throw error;

    // Dispatch communication
    const eventMap: Record<string, string> = {
      'approved': 'vendor_approved',
      'rejected': 'vendor_rejected',
      'suspended': 'vendor_suspended'
    };

    const eventId = eventMap[status];
    if (eventId) {
      dispatchCommunication({
        eventId: eventId as any,
        subOrderId: 'N/A',
        recipientId: vendorId,
        email: (updated.profiles as any)?.email,
        phone_wa: (updated.profiles as any)?.phone
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, vendor: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
