import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─── Helper: verify vendor owns this product ─────────────────────────────── */
async function resolveVendorProduct(supabase: ReturnType<typeof createClient>, productId: string, userId: string) {
  // Ensure the vendor profile exists for this user
  const { data: vendorProfile } = await supabase
    .from("vendor_profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (!vendorProfile) return { error: "Vendor profile not found", status: 404 };

  // Fetch the product ensuring RLS will also enforce ownership
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id, title, slug, description, base_price, is_active,
      rating_avg, rating_count, created_at, category_id,
      categories ( id, name, slug ),
      product_variants ( id, stock, sku, size, color, price_override ),
      product_images   ( id, url, sort_order )
    `)
    .eq("id", productId)
    .eq("vendor_id", vendorProfile.id)
    .single();

  if (error || !product) return { error: "Product not found", status: 404 };

  return { product, vendorProfile };
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

    const result = await resolveVendorProduct(supabase, params.id, user.id);
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

    // Verify ownership first
    const result = await resolveVendorProduct(supabase, params.id, user.id);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

    const body = await request.json();

    // Build the patch payload — only allow known fields
    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) {
      if (!body.title?.trim()) return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
      patch.title = body.title.trim();
      patch.slug  = body.title.trim().toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        + "-" + Date.now();
    }
    if (body.description !== undefined) patch.description = body.description;
    if (body.base_price  !== undefined) {
      if (isNaN(Number(body.base_price)) || Number(body.base_price) <= 0)
        return NextResponse.json({ error: "base_price must be positive" }, { status: 400 });
      patch.base_price = Number(body.base_price);
    }
    if (body.category_id !== undefined) patch.category_id = body.category_id;
    if (body.is_active   !== undefined) patch.is_active   = Boolean(body.is_active);

    if (Object.keys(patch).length === 0 && body.stock === undefined && body.sku === undefined) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // Update products table
    if (Object.keys(patch).length > 0) {
      const { error } = await supabase
        .from("products")
        .update(patch)
        .eq("id", params.id);

      if (error) {
        console.error("[PATCH /api/vendor/products/[id]] products:", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
      }
    }

    // Update the default variant if stock/sku provided
    if (body.stock !== undefined || body.sku !== undefined) {
      const variantPatch: Record<string, unknown> = {};
      if (body.stock !== undefined) variantPatch.stock = Number(body.stock);
      if (body.sku   !== undefined) variantPatch.sku   = body.sku;

      // Find the first variant for this product
      const { data: variants } = await supabase
        .from("product_variants")
        .select("id")
        .eq("product_id", params.id)
        .limit(1);

      if (variants && variants.length > 0) {
        await supabase.from("product_variants").update(variantPatch).eq("id", variants[0].id);
      } else {
        // Create a default variant if none exists
        await supabase.from("product_variants").insert({
          product_id: params.id,
          stock: Number(body.stock ?? 0),
          sku:   body.sku ?? null,
        });
      }
    }

    // Return the updated product
    const { data: updated } = await supabase
      .from("products")
      .select("*, categories(*), product_variants(*), product_images(*)")
      .eq("id", params.id)
      .single();

    return NextResponse.json({ product: updated });
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

    const result = await resolveVendorProduct(supabase, params.id, user.id);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("[DELETE /api/vendor/products/[id]]", error);
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/vendor/products/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}