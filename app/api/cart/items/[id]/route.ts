import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CartService } from '@/src/modules/cart/cart.service';
import { CartRepository } from '@/src/modules/cart/cart.repository';
import { UpdateCartItemDto } from '@/src/modules/cart/cart.dto';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const result = UpdateCartItemDto.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { quantity } = result.data;

    if (quantity === 0) {
      return DELETE(request, { params });
    }

    const cartService = new CartService(new CartRepository());
    const item = await cartService.updateCartItem(params.id, quantity);

    return NextResponse.json({ item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cartService = new CartService(new CartRepository());
    await cartService.removeCartItem(params.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
