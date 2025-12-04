'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { pricingService } from '@/lib/api';
import { Loader, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cart, removeFromCart, updateQuantity, checkout, loading } = useCart();
  
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [checkingOut, setCheckingOut] = useState(false);

  // Calculate totals
  const subtotal = cart?.totalPrice || 0;
  const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal - discount + shipping + tax;

  const handleUpdateQuantity = async (bookId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const item = cart?.items.find((i) => i.bookId === bookId);
    if (!item) return;

    try {
      setUpdatingItemId(bookId);
      await updateQuantity(item.book, newQuantity);
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
      await removeFromCart(bookId);
    } catch (err) {
      console.error('Failed to remove item:', err);
      alert('Failed to remove item. Please try again.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const applyCoupon = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await pricingService.validateCoupon(couponCode, 'user-temp');
      if (response.data.valid) {
        setDiscount(response.data.discountAmount);
        setCouponApplied(true);
      } else {
        alert('Invalid coupon code');
      }
    } catch (err) {
      console.error('Invalid coupon:', err);
      alert('Failed to apply coupon');
    }
  };

  const proceedToCheckout = async () => {
    if (!cart || cart.items.length === 0) return;
    
    try {
      setCheckingOut(true);
      const result = await checkout();
      
      if (result.success) {
        alert(`Order placed successfully! Order ID: ${result.orderId}`);
        router.push(`/orders/${result.orderId}`);
      } else {
        alert('Checkout failed. Please try again.');
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  // Not logged in state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          cartCount={0}
          wishlistCount={0}
          onSearch={(q) => router.push(`/search?q=${q}`)}
          isAuthenticated={false}
        />
        <main className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
              <p className="text-muted-foreground mb-6">
                You need to be logged in to view your cart
              </p>
              <Button onClick={() => router.push('/auth/login')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          cartCount={0}
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
        cartCount={cart?.totalItems || 0}
        wishlistCount={0}
        onSearch={(q) => router.push(`/search?q=${q}`)}
        isAuthenticated={isAuthenticated}
      />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        {!cart || cart.items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Start adding some books to get started!
              </p>
              <Button onClick={() => router.push('/')}>
                Browse Books
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
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
                        <p className="text-sm text-muted-foreground mb-4">
                          {item.book.category}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
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
                              disabled={
                                updatingItemId === item.bookId ||
                                item.quantity >= item.book.stockCount
                              }
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

                        {item.book.stockCount < 5 && (
                          <p className="text-sm text-destructive mt-2">
                            Only {item.book.stockCount} left in stock
                          </p>
                        )}
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
                  {/* Coupon Code */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={couponApplied}
                        className="flex-1 border rounded-lg px-3 py-2 text-sm"
                        placeholder="Enter code"
                      />
                      <Button
                        onClick={applyCoupon}
                        disabled={!couponCode || couponApplied}
                        size="sm"
                      >
                        Apply
                      </Button>
                    </div>
                    {couponApplied && (
                      <p className="text-sm text-green-600 mt-1">
                        Coupon applied! -${discount.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Subtotal ({cart.totalItems} items)
                      </span>
                      <span className="font-semibold">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}

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
                      disabled={checkingOut}
                    >
                      {checkingOut ? (
                        <>
                          <Loader className="animate-spin mr-2" size={20} />
                          Processing...
                        </>
                      ) : (
                        <>
                          Proceed to Checkout
                          <ArrowRight className="ml-2" size={20} />
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => router.push('/')}
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