import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import AbandonedCartEmail from '@/emails/AbandonedCart';

export async function GET(request: Request) {
  try {
    // Verify auth mechanism (e.g. Vercel Cron Secret)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    
    // Find carts that:
    // 1. Have items
    // 2. Haven't been updated in the last 2 hours
    // 3. Haven't been sent an email yet
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    
    // In a real scenario, we would use Supabase RPC or complex query to join carts with cart_items
    const { data: carts, error } = await supabase
      .from('carts')
      .select(`
        id, 
        updated_at, 
        buyer:profiles!buyer_id(id, email, full_name),
        items:cart_items(
          quantity,
          variant:product_variants(
            size,
            price_override,
            product:products(title, base_price, images:product_images(url))
          )
        )
      `)
      .lt('updated_at', twoHoursAgo)
      .is('last_abandoned_email_sent_at', null)
      .not('buyer_id', 'is', null);

    if (error) {
      console.error('Error fetching abandoned carts:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!carts || carts.length === 0) {
      return NextResponse.json({ message: 'No abandoned carts found' });
    }

    let emailsSent = 0;

    for (const cart of carts) {
      // Skip empty carts
      if (!cart.items || cart.items.length === 0) continue;
      
      const buyer: any = Array.isArray(cart.buyer) ? cart.buyer[0] : cart.buyer;
      if (!buyer || !buyer.email) continue;

      const items = cart.items.map((item: any) => {
        const variant = Array.isArray(item.variant) ? item.variant[0] : item.variant;
        const product = Array.isArray(variant?.product) ? variant.product[0] : variant?.product;
        return {
          name: product?.title || 'Unknown Item',
          variant: variant?.size,
          quantity: item.quantity,
          unitPrice: variant?.price_override || product?.base_price || 0,
          image: product?.images?.[0]?.url
        };
      });

      // Send email
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Ordr <hello@ordr.com>',
          to: buyer.email,
          subject: 'Did you forget something? 🛒',
          react: AbandonedCartEmail({
            buyerName: buyer.full_name || 'Customer',
            cartUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ordr-green.vercel.app'}/cart`,
            items
          }),
        });
      }

      // Mark as sent
      await supabase
        .from('carts')
        .update({ last_abandoned_email_sent_at: new Date().toISOString() })
        .eq('id', cart.id);

      emailsSent++;
    }

    return NextResponse.json({ message: `Successfully sent ${emailsSent} abandoned cart emails.` });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
