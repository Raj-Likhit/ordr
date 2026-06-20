'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitReview(formData: FormData) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'You must be logged in to submit a review.' };
  }

  const productId = formData.get('product_id') as string;
  const rating = parseInt(formData.get('rating') as string, 10);
  const comment = formData.get('comment') as string;
  const slug = formData.get('slug') as string;

  if (!productId || isNaN(rating) || rating < 1 || rating > 5) {
    return { error: 'Invalid review data.' };
  }

  // Check if user has already reviewed this product
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('buyer_id', user.id)
    .maybeSingle();

  if (existingReview) {
    return { error: 'You have already reviewed this product.' };
  }

  const { error } = await supabase
    .from('reviews')
    .insert({
      product_id: productId,
      buyer_id: user.id,
      rating,
      comment: comment || null,
    });

  if (error) {
    console.error('Error submitting review:', error);
    return { error: 'Failed to submit review. Please try again.' };
  }

  // Revalidate the product page to show the new review
  if (slug) {
    revalidatePath(`/product/${slug}`);
  }

  return { success: true };
}
