'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { reviewService } from '@/lib/api';
import { Star, Loader, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

interface ReviewPageProps {
  params: {
    id: string;
  };
}

export default function ReviewPage({ params }: ReviewPageProps) {
  const router = useRouter();
  const { isAuthenticated, userEmail } = useAuth();
  const { cart } = useCart();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (reviewText.trim().length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const result = await reviewService.createReview(
        params.id,
        userEmail!,
        rating,
        reviewText
      );

      if (result.data.success) {
        alert('Review submitted successfully!');
        router.push(`/books/${params.id}`);
      } else {
        setError(result.data.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarSelector = () => {
    return (
      <div className="flex gap-2 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={40}
              className={`${
                star <= (hoveredRating || rating)
                  ? 'fill-primary text-primary'
                  : 'fill-muted text-muted'
              } transition-colors`}
            />
          </button>
        ))}
        <span className="ml-4 text-lg font-semibold">
          {rating > 0 ? `${rating} out of 5 stars` : 'Select a rating'}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cart?.totalItems || 0}
        wishlistCount={0}
        onSearch={(q) => router.push(`/search?q=${q}`)}
        isAuthenticated={isAuthenticated}
      />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Book
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Write a Review</CardTitle>
            <p className="text-muted-foreground mt-2">
              Share your thoughts about this book with other readers
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating Selector */}
              <div>
                <label className="block text-lg font-semibold mb-3">
                  Your Rating *
                </label>
                {renderStarSelector()}
              </div>

              {/* Review Text */}
              <div>
                <label
                  htmlFor="review-text"
                  className="block text-lg font-semibold mb-3"
                >
                  Your Review *
                </label>
                <Textarea
                  id="review-text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you think about this book? (minimum 10 characters)"
                  rows={8}
                  className="w-full"
                  maxLength={1000}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {reviewText.length}/1000 characters
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting || rating === 0}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader className="animate-spin mr-2" size={20} />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}