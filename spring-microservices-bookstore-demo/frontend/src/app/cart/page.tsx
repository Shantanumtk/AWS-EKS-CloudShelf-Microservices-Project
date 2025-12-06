'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItem } from '@/types';
import { cartService } from '@/lib/api';
import { Loader, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, userEmail } = useAuth();
  const { refreshCart } = useCart();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const getUserId = () => {
    // If user is authenticated, use their Cognito email
    if (isAuthenticated && userEmail) {
      return userEmail;
    }
    
    // Fallback to guest ID for unauthenticated users
    if (typeof window === 'undefined') return 'guest-temp';
    let userId = localStorage.getItem('guestUserId');
    if (!userId) {
      userId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guestUserId', userId);
    }
    return userId;
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, userEmail]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = getUserId();
      const response = await cartService.getCart(userId);
      setCartItems(response.data.items || []);
    } catch (err) {
      setError('Failed to load cart');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (bookId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const item = cartItems.find(i => i.bookId === bookId);
    if (!item) return;

    try {
      setUpdatingItemId(bookId);
      const userId = getUserId();
      
      // Backend auto-adds quantities, so we need to remove+re-add for update
      await cartService.updateCartItem(
        userId, 
        bookId, 
        newQuantity, 
        item.book.title,  // ✅ CORRECT: item.book.title
        item.price
      );
      
      await fetchCart();
      await refreshCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (bookId: string) => {
    try {
      setUpdatingItemId(bookId);
      const userId = getUserId();
      await cartService.removeCartItem(userId, bookId);
      await fetchCart();
      await refreshCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
      alert('Failed to remove item. Please try again.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const proceedToCheckout = () => {
    router.push('/checkout');
  };

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

  return (
    <div className="min-h-screen bg-background">
      <Header
        wishlistCount={0}
        onSearch={(q) => router.push(`/search?q=${q}`)}
        isAuthenticated={isAuthenticated}
      />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="p-4">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Start adding some books to get started!
              </p>
              <Button onClick={() => router.push('/browse')}>
                Browse Books
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.bookId}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Book Image */}
                      <div
                        className="w-24 h-32 flex-shrink-0 rounded overflow-hidden cursor-pointer"
                        onClick={() => router.push(`/books/${item.bookId}`)}
                      >
                        <img
                          src={item.book.coverImage}
                          alt={item.book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Book Details */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-lg mb-1 cursor-pointer hover:text-primary truncate"
                          onClick={() => router.push(`/books/${item.bookId}`)}
                        >
                          {item.book.title}
                        </h3>
                        <p className="text-muted-foreground mb-2">
                          by {item.book.author}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.bookId, item.quantity - 1)
                              }
                              disabled={updatingItemId === item.bookId}
                              className="px-3 py-1 hover:bg-muted disabled:opacity-50"
                            >
                              -
                            </button>
                            <span className="px-4 py-1 border-x">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.bookId, item.quantity + 1)
                              }
                              disabled={updatingItemId === item.bookId}
                              className="px-3 py-1 hover:bg-muted disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.bookId)}
                            disabled={updatingItemId === item.bookId}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ${item.subtotal.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Subtotal ({cartItems.length} items)
                      </span>
                      <span className="font-semibold">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Shipping
                        {shipping === 0 && (
                          <span className="text-green-600 ml-1">(Free)</span>
                        )}
                      </span>
                      <span className="font-semibold">
                        ${shipping.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>

                    {shipping > 0 && subtotal < 50 && (
                      <p className="text-xs text-muted-foreground">
                        Add ${(50 - subtotal).toFixed(2)} more for free shipping
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold mb-4">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={proceedToCheckout}
                    >
                      Proceed to Checkout
                      <ArrowRight className="ml-2" size={20} />
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => router.push('/browse')}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}