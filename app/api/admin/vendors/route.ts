import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { VendorService } from '@/src/modules/vendors/vendor.service';
import { VendorRepository } from '@/src/modules/vendors/vendor.repository';
import { adminVendorUpdateSchema } from '@/src/modules/vendors/vendor.dto';

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
  
  try {
    const vendorService = new VendorService(new VendorRepository());
    const data = await vendorService.getAllVendorsWithProfiles();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const user = await checkAdmin(supabase);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const body = await request.json();
    const result = adminVendorUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { vendorId, status, reason } = result.data;

    const vendorService = new VendorService(new VendorRepository());
    const updated = await vendorService.updateVendorStatus(vendorId, status, reason);

    return NextResponse.json({ success: true, vendor: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
