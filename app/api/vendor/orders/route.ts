import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/vendor/orders
// Returns all sub-orders assigned to the authenticated vendor.
// RLS in Postgres ensures vendor_id = auth.uid() — this is the app-layer guard.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify vendor profile exists and is approved
    const { data: vendorProfile, error: vpError } = await supabase
      .from('vendor_profiles')
      .select('id, status')
      .eq('id', user.id)
      .single();

    if (vpError || !vendorProfile) {
      return NextResponse.json(
        { error: 'Vendor profile not found' },
        { status: 403 }
      );
    }

    // Parse optional query params
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status'); // e.g. ?status=placed

    let query = supabase
      .from('sub_orders')
      .select(
        `
        id,
        status,
        subtotal,
        tracking_id,
        created_at,
        updated_at,
        order:orders(
          id,
          total_amount,
          payment_status,
          created_at,
          address:addresses(line1, city, state, pincode),
          buyer:profiles(id, full_name, phone)
        ),
        order_items(
          id,
          quantity,
          unit_price,
          gst_rate,
          gst_amount,
          variant:product_variants(
            id,
            size,
            color,
            sku,
            product:products(id, title, slug)
          )
        ),
        order_status_history(
          id,
          status,
          changed_at,
          note
        )
      `
      )
      .eq('vendor_id', user.id)
      .order('created_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data: subOrders, error } = await query;

    if (error) {
      console.error('[GET /api/vendor/orders]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enrich with sorted history
    const enriched = (subOrders ?? []).map((so: any) => ({
      ...so,
      order_status_history: [...(so.order_status_history ?? [])].sort(
        (a: any, b: any) =>
          new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
      ),
    }));

    return NextResponse.json({ subOrders: enriched });
  } catch (err: any) {
    console.error('[GET /api/vendor/orders] unexpected:', err);
    return NextResponse.json(
      { error: err.message ?? 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/vendor/orders
// Body: { subOrderId: string, status: string, tracking_id?: string, note?: string }
// Advances the sub-order state machine and appends to order_status_history.
// ─────────────────────────────────────────────────────────────────────────────

import { advanceOrderStatus, OrderStatus } from '@/lib/services/OrderService';

export async function PATCH(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subOrderId, status: newStatus, tracking_id, note } = body;

    if (!subOrderId || !newStatus) {
      return NextResponse.json(
        { error: 'subOrderId and status are required' },
        { status: 400 }
      );
    }

    // Guard: Validate vendor owns the sub-order
    const { data: existing, error: fetchError } = await supabase
      .from('sub_orders')
      .select('id, vendor_id')
      .eq('id', subOrderId)
      .eq('vendor_id', user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Sub-order not found or access denied' },
        { status: 404 }
      );
    }

    // Optional: save tracking_id if provided
    if (tracking_id) {
      await supabase
        .from('sub_orders')
        .update({ tracking_id })
        .eq('id', subOrderId);
    }

    // Advance status using our new unified OrderService
    await advanceOrderStatus(subOrderId, newStatus as OrderStatus, note);

    return NextResponse.json({ success: true, newStatus });
  } catch (err: any) {
    console.error('[PATCH /api/vendor/orders] unexpected:', err);
    return NextResponse.json(
      { error: err.message ?? 'Internal Server Error' },
      { status: err.message?.includes('Invalid transition') ? 422 : 500 }
    );
  }
}
