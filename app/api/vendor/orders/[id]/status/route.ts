import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrderService } from '@/src/modules/orders/order.service';
import { OrderRepository } from '@/src/modules/orders/order.repository';
import { OrderStatus } from '@/src/modules/orders/order.repository.interface';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    const subOrderId = params.id;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const orderService = new OrderService(new OrderRepository());

    try {
      await orderService.updateVendorOrderStatus(user.id, subOrderId, status as OrderStatus);
      return NextResponse.json({ success: true, status });
    } catch (e: any) {
      if (e.message === 'Sub-order not found or unauthorized') {
        return NextResponse.json({ error: e.message }, { status: 404 });
      }
      if (e.message.startsWith('Invalid transition')) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      throw e;
    }

  } catch (err: any) {
    console.error("[PATCH /api/vendor/orders/[id]/status]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
