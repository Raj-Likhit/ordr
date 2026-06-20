import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CartService } from '@/src/modules/cart/cart.service';
import { CartRepository } from '@/src/modules/cart/cart.repository';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Auth check (HTTP concern)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call service (Business logic)
    const cartRepository = new CartRepository();
    const cartService = new CartService(cartRepository);
    const cart = await cartService.getCart(user.id);

    // Format response (HTTP concern)
    return NextResponse.json({ cart });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
