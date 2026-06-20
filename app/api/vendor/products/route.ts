import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/src/modules/products/product.dto";
import { ProductService } from "@/src/modules/products/product.service";
import { ProductRepository } from "@/src/modules/products/product.repository";

/* ─── GET /api/vendor/products ─────────────────────────────────────────── */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Confirm the user is actually a vendor
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["vendor", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Vendor profile (maps auth uid -> vendor_profiles.id)
    const { data: vendorProfile, error: vpError } = await supabase
      .from("vendor_profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (vpError || !vendorProfile) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const search    = searchParams.get("q") ?? "";
    const statusFilter = searchParams.get("status") ?? "";  // "active" | "draft" | ""
    const page      = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize  = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

    const productService = new ProductService(new ProductRepository());
    const result = await productService.getVendorProducts(vendorProfile.id, {
      search,
      status: statusFilter,
      page,
      pageSize
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/vendor/products] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ─── POST /api/vendor/products ─────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: vendorProfile } = await supabase
      .from("vendor_profiles")
      .select("id, status")
      .eq("id", user.id)
      .single();

    if (!vendorProfile) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
    }

    if (vendorProfile.status !== "approved") {
      return NextResponse.json({ error: "Your vendor account is not yet approved" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = productSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation error", details: parseResult.error.flatten().fieldErrors }, 
        { status: 400 }
      );
    }
    
    const productService = new ProductService(new ProductRepository());
    
    try {
      const product = await productService.createProduct(vendorProfile.id, parseResult.data);
      return NextResponse.json({ product }, { status: 201 });
    } catch (e: any) {
      if (e.message === "A product with this title already exists") {
        return NextResponse.json({ error: e.message }, { status: 409 });
      }
      throw e;
    }

  } catch (err) {
    console.error("[POST /api/vendor/products] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}