import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Auth & Admin Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Total GMV (Sum of non-cancelled sub_orders subtotal)
    // 2. Platform Revenue (Assume 10% take rate for now or fetch from a config)
    // 3. Active Vendors count
    
    const [subOrdersRes, vendorsRes, orderItemsRes] = await Promise.all([
      supabase.from("sub_orders").select("subtotal, status").neq("status", "cancelled"),
      supabase.from("vendor_profiles").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("order_items").select(`
        quantity,
        subtotal,
        variant:product_variants (
          product:products ( id, title, slug, images )
        )
      `)
    ]);

    if (subOrdersRes.error) {
      console.error("Error fetching GMV", subOrdersRes.error);
      return NextResponse.json({ error: "Failed to load metrics" }, { status: 500 });
    }

    const subOrders = subOrdersRes.data || [];
    const totalGMV = subOrders.reduce((sum, order) => sum + Number(order.subtotal || 0), 0);
    const platformRevenue = totalGMV * 0.10; // 10% flat fee assumption
    const activeVendorsCount = vendorsRes.count || 0;

    // Top selling products aggregation
    const items = orderItemsRes.data || [];
    const productSales: Record<string, { id: string; title: string; slug: string; image: string; quantity: number; revenue: number }> = {};

    for (const item of items) {
      const variant: any = Array.isArray(item.variant) ? item.variant[0] : item.variant;
      const product: any = Array.isArray(variant?.product) ? variant.product[0] : variant?.product;
      
      if (!product) continue;

      const pId = product.id;
      if (!productSales[pId]) {
        const imageUrl = Array.isArray(product.images) && product.images.length > 0 
          ? product.images[0] 
          : "/assets/product-card-placeholder.png";

        productSales[pId] = {
          id: pId,
          title: product.title,
          slug: product.slug,
          image: imageUrl,
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[pId].quantity += Number(item.quantity || 0);
      productSales[pId].revenue += Number(item.subtotal || 0);
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return NextResponse.json({
      metrics: {
        gmv: totalGMV,
        platformRevenue,
        activeVendors: activeVendorsCount,
        totalOrders: subOrders.length,
      },
      topProducts,
    });

  } catch (err) {
    console.error("[GET /api/admin/analytics]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
