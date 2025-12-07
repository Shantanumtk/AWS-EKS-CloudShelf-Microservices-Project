'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Review } from '@/types';
import { bookService, reviewService, recommendationService, stockService } from '@/lib/api';
import { Star, ShoppingCart, Heart, Loader, Package, Truck, MessageSquare, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

interface BookDetailPageProps {
  params: {
    id: string;
  };
}

export default function BookDetailPage({ params }: BookDetailPageProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart: addToCartContext } = useCart();
  
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Stock state
  const [stockInfo, setStockInfo] = useState<{
    inStock: boolean;
    availableQuantity: number;
  } | null>(null);
  const [checkingStock, setCheckingStock] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchBookDetails();
      checkBookStock();
    }
  }, [params.id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch book details
      const bookResponse = await bookService.getBookById(params.id);
      setBook(bookResponse.data!);

      // Fetch reviews
      const reviewsResponse = await reviewService.getBookReviews(params.id);
      setReviews(reviewsResponse.data.slice(0, 5));

      // Fetch similar/recommended books
      const recoResponse = await recommendationService.getBookRecommendations(params.id);
      setSimilarBooks(recoResponse.data.slice(0, 4));
    } catch (err) {
      setError('Failed to load book details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkBookStock = async () => {
    try {
      setCheckingStock(true);
      const response = await stockService.checkStockForCart(params.id, 1);
      setStockInfo({
        inStock: response.data.inStock,
        availableQuantity: response.data.availableQuantity,
      });
    } catch (err) {
      console.error('Failed to check stock:', err);
      // Fallback to assuming in stock
      setStockInfo({
        inStock: true,
        availableQuantity: 10,
      });
    } finally {
      setCheckingStock(false);
    }
  };

  const handleAddToCart = async () => {
    if (!book) return;

    // Check stock before adding
    if (stockInfo && !stockInfo.inStock) {
      alert('This item is currently out of stock');
      return;
    }

    if (stockInfo && quantity > stockInfo.availableQuantity) {
      alert(`Only ${stockInfo.availableQuantity} items available in stock`);
      return;
    }

    try {
      setAddingToCart(true);
      
      // Add to cart using CartContext
      await addToCartContext(book._id, quantity, book.title, book.price);
      
      alert(`Added ${quantity}x "${book.title}" to cart!`);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = () => {
    if (!book) return;
    console.log('Added to wishlist:', book.title);
    alert(`Added "${book.title}" to wishlist!`);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-primary text-primary'
                : 'fill-muted text-muted'
            }`}
          />
        ))}
      </div>
    );
  };

  // Calculate actual stock count (use API data if available)
  const actualStockCount = stockInfo ? stockInfo.availableQuantity : book?.stockCount || 0;
  const isInStock = stockInfo ? stockInfo.inStock : book?.inStock || false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          wishlistCount={0}
          onSearch={(q) => router.push(`/search?q=${q}`)}
          isAuthenticated={isAuthenticated}
        />
        <main className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin" size={32} />
          </div>
        </main>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          wishlistCount={0}
          onSearch={(q) => router.push(`/search?q=${q}`)}
          isAuthenticated={isAuthenticated}
        />
        <main className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-destructive mb-4">{error || 'Book not found'}</p>
              <Button onClick={() => router.push('/browse')}>
                Back to Browse
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        wishlistCount={0}
        onSearch={(q) => router.push(`/search?q=${q}`)}
        isAuthenticated={isAuthenticated}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Book Details Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Left: Book Image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Book Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">
                by {book.author}
              </p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {renderStars(book.rating)}
                  <span className="font-semibold">{book.rating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">
                  ({book.reviewCount} reviews)
                </span>
              </div>

              <Badge variant="secondary" className="mb-4">
                {book.category}
              </Badge>
            </div>

            <div className="border-t pt-6">
              <p className="text-3xl font-bold text-primary mb-4">
                ${book.price.toFixed(2)}
              </p>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                {checkingStock ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span className="text-muted-foreground">
                      Checking stock...
                    </span>
                  </>
                ) : isInStock ? (
                  <>
                    <Package className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-semibold">
                      In Stock ({actualStockCount} available)
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <span className="text-destructive font-semibold">
                      Out of Stock
                    </span>
                  </>
                )}
              </div>

              {/* Low Stock Warning */}
              {isInStock && actualStockCount < 5 && actualStockCount > 0 && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-6">
                  <p className="text-sm text-orange-600 font-semibold flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Only {actualStockCount} left in stock - order soon!
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              {isInStock && (
                <div className="flex items-center gap-4 mb-6">
                  <label className="font-semibold">Quantity:</label>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-muted"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 border-x">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(actualStockCount, quantity + 1))}
                      className="px-4 py-2 hover:bg-muted"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!isInStock || addingToCart || checkingStock}
                >
                  {addingToCart ? (
                    <>
                      <Loader className="animate-spin mr-2" size={20} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2" size={20} />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleAddToWishlist}
                >
                  <Heart className="mr-2" size={20} />
                  Wishlist
                </Button>
              </div>

              {/* Shipping Info */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Free Shipping</p>
                    <p className="text-sm text-muted-foreground">
                      On orders over $50. Estimated delivery: 3-5 business days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Book Description */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>About This Book</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {book.description}
            </p>
            {book.isbn && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-semibold">ISBN</p>
                  <p className="text-muted-foreground">{book.isbn}</p>
                </div>
                {book.publisher && (
                  <div>
                    <p className="font-semibold">Publisher</p>
                    <p className="text-muted-foreground">{book.publisher}</p>
                  </div>
                )}
                {book.publishedDate && (
                  <div>
                    <p className="font-semibold">Published</p>
                    <p className="text-muted-foreground">{book.publishedDate}</p>
                  </div>
                )}
                <div>
                  <p className="font-semibold">Category</p>
                  <p className="text-muted-foreground">{book.category}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="mb-12">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customer Reviews</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push(`/books/${params.id}/review`)}
              >
                <MessageSquare className="mr-2" size={18} />
                Write a Review
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {renderStars(review.rating)}
                          <span className="font-semibold">{review.userName}</span>
                          {review.verifiedPurchase && (
                            <Badge variant="outline" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No reviews yet. Be the first to review this book!
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/books/${params.id}/review`)}
                >
                  <MessageSquare className="mr-2" size={18} />
                  Write the First Review
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Similar Books */}
        {similarBooks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarBooks.map((similarBook) => (
                <BookCard
                  key={similarBook._id}
                  book={similarBook}
                  onAddToWishlist={() => console.log('Add to wishlist:', similarBook.title)}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}