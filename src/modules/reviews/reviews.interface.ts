export interface Review {
  id: string;
  product_id: string;
  buyer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface IReviewsRepository {
  hasUserReviewedProduct(userId: string, productId: string): Promise<boolean>;
  createReview(userId: string, productId: string, rating: number, comment?: string | null): Promise<Review>;
}
