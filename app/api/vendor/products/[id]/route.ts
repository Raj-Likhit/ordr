import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProductService } from "@/src/modules/products/product.service";
import { ProductRepository } from "@/src/modules/products/product.repository";
async function resolveVendorProduct(userId: string, productId: string) {
  const supabase = createClient();
  const { data: vendorProfile } = await supabase
    .from("vendor_profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (!vendorProfile) return { error: "Vendor profile not found", status: 404 };

  const productService = new ProductService(new ProductRepository());
  try {
    const product = await productService.getVendorProductById(vendorProfile.id, productId);
    return { product, vendorProfile, productService };
  } catch (e: any) {
    if (e.message === "Product not found") return { error: "Product not found", status: 404 };
    throw e;
  }
}

/* ─── GET /api/vendor/products/[id] ─────────────────────────────────────── */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await resolveVendorProduct(user.id, params.id);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

    return NextResponse.json({ product: result.product });
  } catch (err) {
    console.error("[GET /api/vendor/products/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ─── PATCH /api/vendor/products/[id] ───────────────────────────────────── */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await resolveVendorProduct(user.id, params.id);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

    const body = await request.json();

    if (body.title && !body.title.trim()) {
      return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    }
    if (body.base_price !== undefined && (isNaN(Number(body.base_price)) || Number(body.base_price) <= 0)) {
      return NextResponse.json({ error: "base_price must be positive" }, { status: 400 });
    }

    try {
      const updated = await result.productService.updateProduct(result.vendorProfile.id, params.id, body);
      return NextResponse.json({ product: updated });
    } catch (e: any) {
      if (e.message === "No fields to update") return NextResponse.json({ error: e.message }, { status: 400 });
      throw e;
    }

  } catch (err) {
    console.error("[PATCH /api/vendor/products/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ─── DELETE /api/vendor/products/[id] ──────────────────────────────────── */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await resolveVendorProduct(user.id, params.id);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

    await result.productService.deleteProduct(result.vendorProfile.id, params.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/vendor/products/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}