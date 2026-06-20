import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VendorService } from '@/src/modules/vendors/vendor.service';
import { VendorRepository } from '@/src/modules/vendors/vendor.repository';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, reason } = await request.json();
    const vendorId = params.id;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const vendorService = new VendorService(new VendorRepository());
    await vendorService.updateVendorStatus(vendorId, newStatus, reason);

    return NextResponse.json({ success: true, newStatus });

  } catch (error: any) {
    console.error('Admin Review Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
