import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// We must use the service role key to bypass RLS in a webhook
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const bodyText = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    // Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;

    // We only care about order.paid or payment.captured
    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = event === 'order.paid' ? payload.payload.payment.entity : payload.payload.payment.entity;
      const orderEntity = event === 'order.paid' ? payload.payload.order.entity : null;

      const razorpay_order_id = paymentEntity.order_id || (orderEntity ? orderEntity.id : null);
      const razorpay_payment_id = paymentEntity.id;

      if (!razorpay_order_id) {
        return NextResponse.json({ error: 'Missing razorpay_order_id' }, { status: 400 });
      }

      // Find the order in our database
      const { data: order } = await supabase
        .from('orders')
        .select('id, payment_status')
        .eq('razorpay_order_id', razorpay_order_id)
        .single();

      if (!order) {
        // Order not found, could be an old order or created outside this system
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Idempotency is handled securely inside confirm_checkout RPC
      const { error } = await supabase.rpc('confirm_checkout', {
        p_order_id: order.id,
        p_razorpay_order_id: razorpay_order_id,
        p_razorpay_payment_id: razorpay_payment_id
      });

      if (error) {
        console.error('Confirm RPC error in webhook:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
