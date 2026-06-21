import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import OrderConfirmation from '@/emails/OrderConfirmation';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notifications/order-confirmation
// Body: { orderId: string }
// Sends a branded Ordr order confirmation email via Resend.
// Called internally after the checkout verify-payment flow.
// ─────────────────────────────────────────────────────────────────────────────

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL ?? 'orders@ordr.in';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ordr.in';

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
    const supabase = createClient();

    // ── Auth guard ────────────────────────────────────────────────────────
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // ── Fetch full order data ─────────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(
        `
        id,
        total_amount,
        created_at,
        razorpay_payment_id,
        address:user_addresses(line1:address_line1, line2:address_line2, city, state, pincode),
        buyer:profiles(id, full_name),
        sub_orders(
          id,
          subtotal,
          vendor:vendor_profiles(business_name),
          order_items(
            quantity,
            unit_price,
            gst_amount,
            variant:product_variants(
              size,
              color,
              product:products(title)
            )
          )
        )
      `
      )
      .eq('id', orderId)
      .eq('buyer_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: orderError?.message ?? 'Order not found' },
        { status: 404 }
      );
    }

    // ── Get buyer email from auth ─────────────────────────────────────────
    // Supabase stores email in auth.users — the profiles table may not have it
    const buyerEmail = user.email;
    if (!buyerEmail) {
      return NextResponse.json(
        { error: 'Buyer email not found' },
        { status: 422 }
      );
    }

    // ── Shape data for the template ───────────────────────────────────────
    const addr: any = Array.isArray(order.address)
      ? order.address[0]
      : order.address;
    const buyer: any = Array.isArray(order.buyer)
      ? order.buyer[0]
      : order.buyer;

    const orderDate = new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(order.created_at));

    const subOrders = (order.sub_orders ?? []).map((so: any) => {
      const vendor: any = Array.isArray(so.vendor) ? so.vendor[0] : so.vendor;
      const items = (so.order_items ?? []).map((oi: any) => {
        const variant: any = Array.isArray(oi.variant)
          ? oi.variant[0]
          : oi.variant;
        const product: any = Array.isArray(variant?.product)
          ? variant.product[0]
          : variant?.product;

        const variantLabel = [variant?.size, variant?.color]
          .filter(Boolean)
          .join(' / ');

        return {
          name: product?.title ?? 'Unknown Product',
          variant: variantLabel || undefined,
          quantity: oi.quantity,
          unitPrice: oi.unit_price,
          gstAmount: oi.gst_amount,
        };
      });

      return {
        vendorName: vendor?.business_name ?? 'Artisan',
        items,
        subtotal: so.subtotal,
      };
    });

    const templateProps = {
      buyerName: buyer?.full_name ?? buyerEmail,
      buyerEmail,
      orderId: order.id,
      orderDate,
      paymentId: order.razorpay_payment_id ?? undefined,
      shippingAddress: {
        line1: addr?.line1 ?? '',
        line2: addr?.line2 ?? undefined,
        city: addr?.city ?? '',
        state: addr?.state ?? '',
        pincode: addr?.pincode ?? '',
      },
      subOrders,
      totalAmount: order.total_amount,
      orderUrl: `${APP_URL}/account/orders/${order.id}`,
    };

    // ── Send email via Resend ─────────────────────────────────────────────
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `Ordr <${FROM_ADDRESS}>`,
      to: [buyerEmail],
      subject: `Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
      react: OrderConfirmation(templateProps),
    });

    if (emailError) {
      console.error('[order-confirmation email] Resend error:', emailError);
      // Log to notification_log as failed
      await supabase.from('notification_log').insert({
        recipient_id: user.id,
        channel: 'email',
        event: 'order_placed',
        status: 'failed',
      });
      return NextResponse.json({ error: emailError.message }, { status: 502 });
    }

    // ── Log successful send ───────────────────────────────────────────────
    const firstSubOrder: any = (order.sub_orders ?? [])[0];
    await supabase.from('notification_log').insert({
      recipient_id: user.id,
      channel: 'email',
      event: 'order_placed',
      sub_order_id: firstSubOrder?.id ?? null,
      status: 'sent',
    });

    return NextResponse.json({ success: true, emailId: emailData?.id });
  } catch (err: any) {
    console.error('[POST /api/notifications/order-confirmation] unexpected:', err);
    return NextResponse.json(
      { error: err.message ?? 'Internal Server Error' },
      { status: 500 }
    );
  }
}
