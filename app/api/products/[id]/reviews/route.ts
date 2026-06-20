import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating, comment } = await request.json();
    
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    // Insert the review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        product_id: params.id,
        buyer_id: session.user.id,
        rating: Number(rating),
        comment: comment || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting review:', insertError);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    // Recalculate average and count using a raw SQL function or via admin query
    // Since we need to update products and only vendor can do it via RLS,
    // we use the service role client or an RPC if we had one.
    // For now, let's fetch all reviews and compute the new avg, then update products.
    // Since this endpoint uses standard createClient() which uses user's auth token,
    // wait, we need the Service Role key to bypass RLS and update `products.rating_avg`.
    // Let's create an admin client.
    
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: allReviews } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('product_id', params.id);

    if (allReviews) {
      const count = allReviews.length;
      const sum = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const avg = count > 0 ? Number((sum / count).toFixed(1)) : 0;

      await supabaseAdmin
        .from('products')
        .update({
          rating_avg: avg,
          rating_count: count
        })
        .eq('id', params.id);
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
