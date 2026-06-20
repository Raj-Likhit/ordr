import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { db_order_id } = body;

    if (!db_order_id) {
      return NextResponse.json({ error: 'Missing db_order_id parameter' }, { status: 400 });
    }

    // Ensure the order belongs to the user and is still pending
    const { data: order } = await supabase
      .from('orders')
      .select('id, payment_status')
      .eq('id', db_order_id)
      .eq('buyer_id', user.id)
      .single();
      
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.payment_status !== 'pending_payment') {
      return NextResponse.json({ error: 'Order is not in pending state' }, { status: 400 });
    }

    // Call cancel_checkout RPC
    const { error } = await supabase.rpc('cancel_checkout', {
      p_order_id: db_order_id
    });

    if (error) {
      console.error('Cancel RPC error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Cancel payment error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
