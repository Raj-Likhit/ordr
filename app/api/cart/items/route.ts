import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CartService } from '@/src/modules/cart/cart.service';
import { CartRepository } from '@/src/modules/cart/cart.repository';
import { AddToCartDto } from '@/src/modules/cart/cart.dto';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Auth check
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Input parsing and validation
    const body = await request.json();
    const result = AddToCartDto.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { variant_id, quantity } = result.data;

    // Business Logic
    const cartService = new CartService(new CartRepository());
    const item = await cartService.addToCart(user.id, variant_id, quantity);

    // Output formatting (HTTP concern)
    return NextResponse.json({ item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
