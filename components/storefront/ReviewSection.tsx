import { createClient } from '@/lib/supabase/server';
import { WriteReviewForm } from '@/components/ui/WriteReviewForm';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

interface ReviewSectionProps {
  productId: string;
  slug: string;
}

export default async function ReviewSection({ productId, slug }: ReviewSectionProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: rawReviews, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      profiles (
        full_name
      )
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  // Fallback in case of error
  const reviews: Review[] = rawReviews as unknown as Review[] || [];
  
  // Calculate aggregate
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : 0;


  // Let's actually get rawReviews with buyer_id for checking hasReviewed properly
  const { data: reviewsWithBuyer } = await supabase
    .from('reviews')
    .select('id, buyer_id')
    .eq('product_id', productId);

  const userHasReviewed = user && reviewsWithBuyer?.some((r) => r.buyer_id === user.id);

  return (
    <div className="mt-16 lg:mt-24 border-t border-gray-200 pt-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Summary & CTA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
            <div className="text-5xl font-extrabold text-gray-900 tracking-tight">
              {averageRating}
            </div>
            <div className="mt-2 flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Number(averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {!userHasReviewed && user ? (
            <WriteReviewForm productId={productId} slug={slug} />
          ) : !user ? (
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium border border-blue-100">
              Please log in to write a review.
            </div>
          ) : null}
        </div>

        {/* Right column: Review List */}
        <div className="lg:col-span-8">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Star className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
              <p className="mt-1 text-gray-500">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {review.profiles?.full_name || 'Anonymous User'}
                      </h4>
                      <div className="mt-1 flex items-center space-x-2">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating ? 'fill-current' : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-400">·</span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <div className="mt-4 text-gray-700 leading-relaxed">
                      {review.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
