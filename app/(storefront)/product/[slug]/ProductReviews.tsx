"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Review Form State
  const { user } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    loadReviews();
  }, [productId]);

  async function loadReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, rating, comment, created_at,
        profiles:buyer_id ( full_name )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data as unknown as Review[]);
    }
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a star rating.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit review");
      }

      // Reset form and reload reviews
      setRating(0);
      setComment("");
      setShowForm(false);
      await loadReviews();
      
      // Refresh the page data so the average rating updates at the top
      router.refresh();
      
    } catch (err) {
      console.error(err);
      alert("Could not submit your review. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="mt-16 border-t border-[var(--color-border)] pt-12 animate-pulse flex space-x-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></div>;
  }

  return (
    <div className="mt-16 border-t border-[var(--color-border)] pt-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h2 className="font-display text-[var(--text-subtitle)]">Customer Reviews</h2>
        
        {user && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-6 py-2 border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--text-small)] font-medium hover:bg-[var(--color-bg-surface)] transition-colors"
          >
            Write a Review
          </button>
        )}
        {!user && (
          <p className="text-[var(--text-small)] text-[var(--color-text-muted)]">
            Log in to write a review
          </p>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-12 bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <h3 className="font-medium text-[var(--color-text-primary)] mb-4">Leave your review</h3>
          
          <div className="mb-4">
            <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-2">Overall Rating *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    size={28} 
                    className={star <= (hoverRating || rating) ? "fill-[var(--color-warning)] text-[var(--color-warning)]" : "text-[var(--color-border)]"} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-2">Written Review</label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like about this piece? How was the quality?"
              className="w-full px-4 py-3 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--text-body)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-subtle)] outline-none transition-all resize-y"
            />
          </div>

          <div className="flex gap-3">
            <button 
              type="submit" 
              disabled={isSubmitting || rating === 0}
              className="px-6 py-2.5 bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)] text-[var(--text-small)] font-medium hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Submit Review
            </button>
            <button 
              type="button" 
              onClick={() => { setShowForm(false); setRating(0); setComment(""); }}
              className="px-6 py-2.5 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-[var(--radius-sm)] text-[var(--text-small)] font-medium hover:bg-[var(--color-bg-surface)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      
      {/* Review List */}
      {reviews.length === 0 ? (
        <div className="text-center p-8 bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)]">
          <p className="text-[var(--color-text-secondary)] font-body">No reviews yet for this piece.</p>
          <p className="text-[var(--text-small)] text-[var(--color-text-muted)] mt-2">Be the first to review after purchase!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-[var(--color-border)] pb-8 last:border-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex text-[var(--color-warning)]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className={i < review.rating ? "fill-current" : "text-[var(--color-border)]"} />
                    ))}
                  </div>
                  <span className="font-medium text-[var(--color-text-primary)]">{review.profiles?.full_name || "Anonymous User"}</span>
                </div>
                <span className="text-[var(--text-small)] text-[var(--color-text-muted)]">
                  {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {review.comment && (
                <p className="text-[var(--color-text-secondary)] font-body text-[var(--text-body)] leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
