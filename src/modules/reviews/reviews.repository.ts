import { SupabaseClient } from '@supabase/supabase-js';
import { IReviewsRepository, Review } from './reviews.interface';

export class ReviewsRepository implements IReviewsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async hasUserReviewedProduct(userId: string, productId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('buyer_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to check review existence: ${error.message}`);
    }

    return !!data;
  }

  async createReview(userId: string, productId: string, rating: number, comment?: string | null): Promise<Review> {
    const { data, error } = await this.supabase
      .from('reviews')
      .insert({
        product_id: productId,
        buyer_id: userId,
        rating,
        comment: comment || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create review: ${error.message}`);
    }

    return data;
  }
}
