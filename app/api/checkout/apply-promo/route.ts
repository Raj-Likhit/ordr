import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid or inactive promo code' }, { status: 404 });
    }

    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 });
    }

    return NextResponse.json({ promo: data });
  } catch (error: any) {
    console.error('Error applying promo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
