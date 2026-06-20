'use client';

import { useState } from 'react';
import { submitReview } from '@/app/actions/reviews';
import { Star } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    >
      {pending ? 'Submitting...' : 'Submit Review'}
    </button>
  );
}

interface WriteReviewFormProps {
  productId: string;
  slug: string;
  onSuccess?: () => void;
}

export function WriteReviewForm({ productId, slug, onSuccess }: WriteReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    
    setError(null);
    formData.append('product_id', productId);
    formData.append('slug', slug);
    formData.append('rating', rating.toString());
    
    const result = await submitReview(formData);
    
    if (result.error) {
      setError(result.error);
    } else {
      setRating(0);
      setHoveredRating(0);
      if (onSuccess) {
        onSuccess();
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
      
      <form action={action} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <div className="flex space-x-1" onMouseLeave={() => setHoveredRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`h-8 w-8 ${
                    (hoveredRating || rating) >= star
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  } transition-colors duration-200`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Review (Optional)
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            placeholder="What did you like or dislike about this product?"
          />
        </div>

        <div className="pt-2">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
