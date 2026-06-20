import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PaymentService } from '@/src/modules/payments/payment.service';
import { PaymentRepository } from '@/src/modules/payments/payment.repository';
import { CartService } from '@/src/modules/cart/cart.service';
import { CartRepository } from '@/src/modules/cart/cart.repository';
import { CreateCheckoutDto } from '@/src/modules/payments/payment.dto';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const result = CreateCheckoutDto.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { address_id: addressId, payment_method, coupon_code } = result.data;

    const cartService = new CartService(new CartRepository());
    const cart = await cartService.getCart(user.id);
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const paymentService = new PaymentService(new PaymentRepository());
    const response = await paymentService.processCheckout(user.id, addressId, cart.items, payment_method, coupon_code);
    
    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Razorpay order creation error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}
