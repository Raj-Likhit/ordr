import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { VendorService } from '@/src/modules/vendors/vendor.service';
import { VendorRepository } from '@/src/modules/vendors/vendor.repository';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  
  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { status } = await request.json();
  if (!['approved', 'rejected', 'suspended', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    const vendorService = new VendorService(new VendorRepository());
    const data = await vendorService.updateVendorStatus(params.id, status);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
