import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bank_account_number, bank_ifsc, bank_account_holder, business_name, email } = body;

    if (!bank_account_number || !bank_ifsc || !bank_account_holder) {
      return NextResponse.json({ error: "Bank details are required" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_fallback',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_fallback',
    });

    // Create a Linked Account using Razorpay Route
    const accountPayload = {
      name: bank_account_holder,
      email: email || user.email,
      tnc_accepted: true,
      account_details: {
        business_name: business_name || "Vendor Store",
        business_type: "individual"
      },
      bank_account: {
        ifsc_code: bank_ifsc,
        account_number: bank_account_number,
        beneficiary_name: bank_account_holder
      }
    };

    const account = await razorpay.accounts.create(accountPayload as any);

    if (!account || !account.id) {
      return NextResponse.json({ error: "Failed to create Razorpay account" }, { status: 500 });
    }

    // Save to vendor_profiles
    const { error: updateError } = await supabase
      .from("vendor_profiles")
      .update({
        razorpay_account_id: account.id,
        bank_account_number,
        bank_ifsc,
        bank_account_holder
      })
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, account_id: account.id });
  } catch (error: any) {
    console.error("Razorpay Onboarding Error:", error);
    return NextResponse.json(
      { error: error?.error?.description || error.message || "Failed to onboard with Razorpay" },
      { status: 500 }
    );
  }
}
