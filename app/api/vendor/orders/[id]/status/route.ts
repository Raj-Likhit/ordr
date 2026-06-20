import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';
import { notifyOrderStatusChanged } from '@/lib/notify';

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

    // Verify sub-order belongs to this vendor
    const { data: subOrder, error: fetchError } = await supabase
      .from('sub_orders')
      .select('*, order:orders(id, razorpay_payment_id, user_id)')
      .eq('id', subOrderId)
      .eq('vendor_id', user.id)
      .single();

    if (fetchError || !subOrder) {
      return NextResponse.json({ error: 'Sub-order not found or unauthorized' }, { status: 404 });
    }

    // Update status in DB
    const { error: updateError } = await supabase
      .from('sub_orders')
      .update({ status })
      .eq('id', subOrderId);

    if (updateError) {
      throw updateError;
    }

    // Fetch buyer profile for notifications
    const orderUserId = Array.isArray(subOrder.order) ? subOrder.order[0]?.user_id : subOrder.order?.user_id;
    const orderIdStr = Array.isArray(subOrder.order) ? subOrder.order[0]?.id : subOrder.order?.id;
    
    if (orderUserId && orderIdStr) {
      const { data: buyerProfile } = await supabase.from('profiles').select('*').eq('id', orderUserId).single();
      const { data: vendorProfile } = await supabase.from('profiles').select('business_name').eq('id', user.id).single();
      
      if (buyerProfile && (buyerProfile.email || buyerProfile.phone)) {
        await notifyOrderStatusChanged({
          buyerEmail: buyerProfile.email || '',
          buyerPhone: buyerProfile.phone,
          buyerTelegramId: buyerProfile.telegram_chat_id,
          orderId: orderIdStr,
          subOrderId: subOrderId,
          vendorName: vendorProfile?.business_name || 'Ordr Vendor',
          newStatus: status,
        });
      }
    }

    // Escrow Release Logic if status is DELIVERED
    if (status.toUpperCase() === 'DELIVERED') {
      const paymentId = Array.isArray(subOrder.order) ? subOrder.order[0]?.razorpay_payment_id : subOrder.order?.razorpay_payment_id;
      
      if (paymentId) {
        const razorpay = new Razorpay({
          key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_fallback',
          key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_fallback',
        });

        try {
          // Fetch all transfers for this payment
          const transfers = await (razorpay.payments as any).fetchTransfers(paymentId);
          
          if (transfers && transfers.items) {
            // Find the specific transfer for this vendor
            const vendorTransfer = transfers.items.find(
              (t: any) => t.notes && t.notes.vendor_id === user.id
            );

            if (vendorTransfer && vendorTransfer.on_hold) {
              // Release the hold
              await razorpay.transfers.edit(vendorTransfer.id, { on_hold: 0 });
              
              // Mark as settled in DB
              await supabase
                .from('sub_orders')
                .update({ payout_status: 'settled', payout_transfer_id: vendorTransfer.id })
                .eq('id', subOrderId);
            }
          }
        } catch (rzpError: any) {
          console.error("Razorpay Escrow Release Error:", rzpError);
          // We don't throw here to avoid failing the status update,
          // but in production we'd queue this for retry or alert admin.
        }
      }
    }

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error("Order Status Update Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update status" }, { status: 500 });
  }
}
