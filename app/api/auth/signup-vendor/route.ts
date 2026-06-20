import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, businessName } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server misconfigured: missing service role key" }, { status: 500 });
    }

    // Initialize service role client to bypass email confirmation and rate limits
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Create user in Auth
    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = userData.user.id;

    // Create profile
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      role: "vendor",
      full_name: fullName,
    });

    if (profileError) {
      console.error("Profile creation error:", profileError.message);
      // clean up user if profile fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 });
    }

    // Create vendor profile (automatically approved for testing)
    const { error: vendorError } = await supabaseAdmin.from("vendor_profiles").insert({
      id: userId,
      business_name: businessName || `${fullName}'s Studio`,
      status: "approved",
    });

    if (vendorError) {
      console.error("Vendor profile creation error:", vendorError.message);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: "Failed to create vendor profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId });
  } catch (error: any) {
    console.error("Signup vendor route error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
