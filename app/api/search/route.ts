import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

    if (!q) {
      return NextResponse.json({ results: [], total: 0, page, pageSize });
    }

    // We'll search across products by title or description using ilike
    let query = supabase
      .from("products")
      .select(`
        id, title, slug, description, base_price, is_active,
        images, rating_avg, rating_count,
        vendor_id,
        vendor:vendor_profiles ( business_name, store_slug ),
        category:categories ( name, slug )
      `, { count: "exact" })
      .eq("is_active", true);

    // Or logic for search
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data: products, error, count } = await query;

    if (error) {
      console.error("[GET /api/search]", error);
      return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 });
    }

    return NextResponse.json({
      results: products ?? [],
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("[GET /api/search] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
