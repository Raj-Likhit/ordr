import { createClient } from '@/lib/supabase/server';
import { dispatchCommunication } from './commService';

export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';

// Valid transitions map
export const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

export async function advanceOrderStatus(
  subOrderId: string,
  newStatus: OrderStatus,
  note?: string
) {
  const supabase = createClient();

  // 1. Fetch current status & full context
  const { data: order, error } = await supabase
    .from('sub_orders')
    .select(`
      status, 
      vendor_id,
      orders:order_id (
        buyer_id,
        profiles:buyer_id (
          email,
          phone
        )
      )
    `)
    .eq('id', subOrderId)
    .single();

  if (error || !order) throw new Error('Order not found');

  // 2. Guard: validate transition
  if (!ALLOWED[order.status as OrderStatus]?.includes(newStatus)) {
    throw new Error(`Invalid transition: ${order.status} -> ${newStatus}`);
  }

  // 3. Update status
  const { error: updateErr } = await supabase
    .from('sub_orders')
    .update({ status: newStatus })
    .eq('id', subOrderId);

  if (updateErr) throw updateErr;

  // 4. Log to history
  await supabase.from('order_status_history').insert({
    sub_order_id: subOrderId,
    status: newStatus,
    note: note || `Status changed from ${order.status} to ${newStatus}`
  });

  // 5. Fire communications (simulating Edge Function triggers)
  const buyerId = (order.orders as any)?.buyer_id;
  const buyerProfile = (order.orders as any)?.profiles;
  const buyerEmail = buyerProfile?.email;
  const buyerPhone = buyerProfile?.phone;

  // Map order status to template event
  const eventMap: Record<string, any> = {
    'placed': 'order_placed',
    'shipped': 'order_shipped',
    'delivered': 'order_delivered',
    'cancelled': 'order_cancelled',
    'returned': 'order_returned'
  };

  const eventId = eventMap[newStatus];
  if (eventId) {
    // Dispatch in the background
    dispatchCommunication({
      eventId,
      subOrderId,
      recipientId: buyerId,
      email: buyerEmail,
      phone_wa: buyerPhone
    }).catch(console.error);
  }

  // 6. If delivered -> auto-generate invoice
  if (newStatus === 'delivered') {
    // Generate invoice asynchronously via API route to avoid blocking client
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/invoice/${subOrderId}/generate`, { method: 'POST' }).catch(console.error);
  }
}
