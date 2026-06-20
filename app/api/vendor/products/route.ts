import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations/product";

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

    let query = supabase
      .from("products")
      .select(`
        id, title, slug, description, base_price, is_active,
        rating_avg, rating_count, created_at,
        categories ( id, name, slug ),
        product_variants ( id, stock, sku, size, color, price_override )
      `, { count: "exact" })
      .eq("vendor_id", vendorProfile.id)
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }
    if (statusFilter === "active") {
      query = query.eq("is_active", true);
    } else if (statusFilter === "draft") {
      query = query.eq("is_active", false);
    }

    const { data: products, error, count } = await query;

    if (error) {
      console.error("[GET /api/vendor/products]", error);
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    return NextResponse.json({
      products: products ?? [],
      total: count ?? 0,
      page,
      pageSize,
    });
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
    
    const { title, description, base_price, category_id, is_active, stock, sku } = parseResult.data;

    // Generate slug from title
    const slug = title.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      + "-" + Date.now();

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        vendor_id:   vendorProfile.id,
        title:       title.trim(),
        slug,
        description: description ?? null,
        base_price:  Number(base_price),
        category_id: category_id ?? null,
        is_active:   Boolean(is_active),
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/vendor/products]", error);
      if (error.code === "23505") {
        return NextResponse.json({ error: "A product with this title already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }

    // If variants array is provided, insert them. Otherwise fallback to stock/sku default variant
    if (body.variants && body.variants.length > 0) {
      const variantInserts = body.variants.map((v: any) => ({
        product_id: product.id,
        size: v.size || null,
        color: v.color || null,
        stock: Number(v.stock ?? 0),
        sku: v.sku || null,
        price_override: v.price_override ? Number(v.price_override) : null
      }));
      await supabase.from("product_variants").insert(variantInserts);
    } else if (body.stock !== undefined || body.sku) {
      await supabase.from("product_variants").insert({
        product_id: product.id,
        stock:      Number(body.stock ?? 0),
        sku:        body.sku ?? null,
      });
    }

    // Insert images if provided
    if (body.images && body.images.length > 0) {
      const imageInserts = body.images.map((url: string, index: number) => ({
        product_id: product.id,
        url: url,
        sort_order: index
      }));
      await supabase.from("product_images").insert(imageInserts);
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/vendor/products] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}