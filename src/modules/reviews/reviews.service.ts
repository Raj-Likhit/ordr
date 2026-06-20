import { IReviewsRepository, Review } from './reviews.interface';
import { SubmitReviewInput } from './reviews.dto';

export class ReviewsService {
  constructor(private readonly reviewsRepository: IReviewsRepository) {}

  /**
   * Submits a new review for a product.
   * Enforces the business rule that a user can only review a product once.
   */
  async submitReview(userId: string, input: SubmitReviewInput): Promise<{ success: boolean; error?: string; review?: Review }> {
    try {
      const hasReviewed = await this.reviewsRepository.hasUserReviewedProduct(userId, input.productId);
      
      if (hasReviewed) {
        return { success: false, error: 'You have already reviewed this product.' };
      }

      const review = await this.reviewsRepository.createReview(userId, input.productId, input.rating, input.comment);
      return { success: true, review };
    } catch (error: any) {
      console.error('ReviewsService.submitReview error:', error);
      return { success: false, error: 'Failed to submit review. Please try again later.' };
    }
  }
}
