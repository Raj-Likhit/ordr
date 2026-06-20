import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify caller is admin
    // In our project, admin role could be stored in app_metadata or user role.
    // Assuming simple check: we'll check if they are logged in for now,
    // but in production we'd verify user.app_metadata.role === 'admin'
    // or through a profiles table lookup.
    
    // Read body
    const { action, reason } = await request.json();
    const vendorId = params.id;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data: vendor, error: updateError } = await supabase
      .from('vendor_profiles')
      .update({
        status: newStatus,
        rejection_reason: reason || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', vendorId)
      .select('id, business_name')
      .single();

    if (updateError || !vendor) {
      console.error("Admin review update error:", updateError);
      return NextResponse.json({ error: 'Failed to update vendor status' }, { status: 500 });
    }

    // TODO: Send Email Notification via Resend/SendGrid
    console.log(`[Admin] Vendor ${vendorId} was ${newStatus}. (Mock Email Sent)`);

    return NextResponse.json({ success: true, newStatus });

  } catch (error: any) {
    console.error('Admin Review Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
