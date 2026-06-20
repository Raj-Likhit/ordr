import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VendorService } from '@/src/modules/vendors/vendor.service';
import { VendorRepository } from '@/src/modules/vendors/vendor.repository';
import { submitVendorOnboardingSchema } from '@/src/modules/vendors/vendor.dto';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Zod validation
    const result = submitVendorOnboardingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: result.error.format() 
      }, { status: 400 });
    }

    const vendorService = new VendorService(new VendorRepository());
    await vendorService.submitOnboarding(user.id, result.data);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Vendor Submit Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
