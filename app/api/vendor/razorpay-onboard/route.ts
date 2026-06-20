import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { VendorService } from "@/src/modules/vendors/vendor.service";
import { VendorRepository } from "@/src/modules/vendors/vendor.repository";
import { razorpayOnboardSchema } from "@/src/modules/vendors/vendor.dto";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = razorpayOnboardSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: result.error.format() 
      }, { status: 400 });
    }

    const vendorService = new VendorService(new VendorRepository());
    const accountId = await vendorService.onboardWithRazorpay(
      user.id, 
      user.email || '', 
      result.data
    );

    return NextResponse.json({ success: true, account_id: accountId });
  } catch (error: any) {
    console.error("Razorpay Onboarding Error:", error);
    return NextResponse.json(
      { error: error?.error?.description || error.message || "Failed to onboard with Razorpay" },
      { status: 500 }
    );
  }
}
