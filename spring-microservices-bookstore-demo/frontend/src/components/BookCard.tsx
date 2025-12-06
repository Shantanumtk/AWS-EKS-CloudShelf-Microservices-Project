'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Book } from '@/types';
import { useCart } from '@/contexts/CartContext';

interface BookCardProps {
  book: Book;
  onAddToCart?: (book: Book) => void;
  onAddToWishlist?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onAddToCart,
  onAddToWishlist,
}) => {
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsAddingToCart(true);
      
      // Use CartContext which handles everything
      await addToCart(book._id, 1, book.title, book.price);
      
      // Notify parent (optional)
      if (onAddToCart) {
        onAddToCart(book);
      }

      // Visual feedback
      alert(`Added "${book.title}" to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onAddToWishlist) {
      onAddToWishlist(book);
    }
  };

  return (
    <Link href={`/books/${book._id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <CardContent className="p-4">
          <div className="relative mb-4 aspect-[2/3] overflow-hidden rounded-lg">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold line-clamp-2 min-h-[3rem]">
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {book.author}
            </p>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.floor(book.rating)
                      ? 'fill-primary text-primary'
                      : 'fill-muted text-muted'
                  }
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">
                ({book.reviewCount || 0})
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-primary">
                ${book.price.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            className="flex-1"
            size="sm"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            <ShoppingCart size={16} className="mr-2" />
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddToWishlist}
          >
            <Heart size={16} />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};