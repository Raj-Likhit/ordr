import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/src/modules/auth/auth.service";
import { AuthRepository } from "@/src/modules/auth/auth.repository";
import { signupVendorSchema } from "@/src/modules/auth/auth.dto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = signupVendorSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ 
        error: "Missing required fields", 
        details: result.error.format() 
      }, { status: 400 });
    }

    const authService = new AuthService(new AuthRepository());
    const userId = await authService.signupVendor(result.data);

    return NextResponse.json({ success: true, userId });
  } catch (error: any) {
    console.error("Signup vendor route error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" }, 
      { status: error.message?.includes('misconfigured') ? 500 : 400 }
    );
  }
}
