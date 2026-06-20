import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrderService } from '@/src/modules/orders/order.service';
import { OrderRepository } from '@/src/modules/orders/order.repository';

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const supabase = createClient();

    // ── Auth guard ──────────────────────────────────────────────────────────
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = params.id;

    // ── Call service ────────────────────────────────────────────────────────
    const orderService = new OrderService(new OrderRepository());
    const order = await orderService.getOrderById(orderId, user.id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    console.error('[GET /api/orders/[id]] unexpected:', err);
    return NextResponse.json(
      { error: err.message ?? 'Internal Server Error' },
      { status: 500 }
    );
  }
}
