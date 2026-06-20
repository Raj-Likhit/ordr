'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { SubmitReviewDto } from '@/src/modules/reviews/reviews.dto';
import { ReviewsRepository } from '@/src/modules/reviews/reviews.repository';
import { ReviewsService } from '@/src/modules/reviews/reviews.service';

export async function submitReview(formData: FormData) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'You must be logged in to submit a review.' };
  }

  // 1. Validation Layer (DTO)
  const parseResult = SubmitReviewDto.safeParse({
    productId: formData.get('product_id'),
    rating: parseInt(formData.get('rating') as string, 10),
    comment: formData.get('comment'),
  });

  if (!parseResult.success) {
    console.error('Validation error:', parseResult.error.format());
    return { error: 'Invalid review data. Please ensure all fields are correct.' };
  }

  // 2. Application Service Layer
  const repository = new ReviewsRepository(supabase);
  const service = new ReviewsService(repository);
  
  const result = await service.submitReview(user.id, parseResult.data);

  if (!result.success) {
    return { error: result.error };
  }

  // 3. Presentation Layer (HTTP / Revalidation)
  const slug = formData.get('slug') as string;
  if (slug) {
    revalidatePath(`/product/${slug}`);
  }

  return { success: true };
}
