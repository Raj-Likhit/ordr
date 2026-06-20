import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
import { OrderService } from '@/src/modules/orders/order.service';
import { OrderRepository } from '@/src/modules/orders/order.repository';

export async function GET() {
  try {
    const supabase = createClient();

    // ── Auth guard ──────────────────────────────────────────────────────────
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Call service ────────────────────────────────────────────────────────
    const orderService = new OrderService(new OrderRepository());
    const enrichedOrders = await orderService.getOrdersForBuyer(user.id);

    return NextResponse.json({ orders: enrichedOrders });
  } catch (err: any) {
    console.error('[GET /api/orders] unexpected:', err);
    return NextResponse.json(
      { error: err.message ?? 'Internal Server Error' },
      { status: 500 }
    );
  }
}
