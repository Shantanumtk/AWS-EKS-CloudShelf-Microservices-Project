'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Book } from '@/types';
import { bookService } from '@/lib/api';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function BrowsePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchBooks();
  }, [page]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await bookService.getBooks(page, ITEMS_PER_PAGE);
      setBooks(response.data.data);
      setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
      setHasMore(response.data.hasMore);
    } catch (err) {
      setError('Failed to load books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (hasMore || page < totalPages) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading && page === 1) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          wishlistCount={0}
          onSearch={(q) => router.push(`/search?q=${q}`)}
          isAuthenticated={isAuthenticated}
        />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchBooks}>Try Again</Button>
          </div>
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

      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse All Books</h1>
          <p className="text-muted-foreground">
            Discover our complete collection of books
          </p>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin" size={32} />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No books available</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {books.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  onAddToWishlist={() => console.log('Add to wishlist:', book.title)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                >
                  <ChevronLeft className="mr-2" size={20} />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={!hasMore && page >= totalPages}
                >
                  Next
                  <ChevronRight className="ml-2" size={20} />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}