import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { product_id, question_text } = await request.json();
    
    if (!product_id || !question_text) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Anonymous questions allowed if you want, but linking to user is better
    const { data, error } = await supabase.from('product_qa').insert({
      product_id,
      question_text,
      asked_by_user_id: user?.id || null,
    }).select().single();

    if (error) throw error;
    
    return NextResponse.json({ qa: data });
  } catch (error: any) {
    console.error('Error posting question:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');
  const vendorId = url.searchParams.get('vendorId');

  const supabase = createClient();
  let query = supabase.from('product_qa').select(`
    *,
    products ( title, slug )
  `);

  if (productId) {
    query = query.eq('product_id', productId);
  }
  
  if (vendorId) {
    // We need to filter by vendor_id on products table, but we don't have it directly in product_qa
    // Supabase allows filtering on foreign tables
    query = query.eq('products.vendor_id', vendorId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If we filtered by vendorId, we need to remove nulls (rows that didn't match the foreign table filter)
  const filteredData = vendorId ? data.filter((d: any) => d.products !== null) : data;

  return NextResponse.json({ questions: filteredData });
}
