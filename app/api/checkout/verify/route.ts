import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PaymentService } from '@/src/modules/payments/payment.service';
import { PaymentRepository } from '@/src/modules/payments/payment.repository';
import { VerifyPaymentDto } from '@/src/modules/payments/payment.dto';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const result = VerifyPaymentDto.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      db_order_id
    } = result.data;

    const paymentService = new PaymentService(new PaymentRepository());
    await paymentService.verifyPayment(db_order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature);

    return NextResponse.json({ success: true, orderId: db_order_id });
  } catch (err: any) {
    console.error('Verify payment error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: err.message === 'Invalid payment signature' ? 400 : 500 });
  }
}
