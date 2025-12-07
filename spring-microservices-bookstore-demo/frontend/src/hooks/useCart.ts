import { useState, useEffect, useCallback } from 'react';
import { cartService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Book, Cart } from '@/types';

export function useCart() {
  const { userEmail, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null); // ← Changed from 'any' to 'Cart | null'
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !userEmail) return;
    const res = await cartService.getCart(userEmail);
    setCart(res.data);
  }, [isAuthenticated, userEmail]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (book: Book) => {
    if (!isAuthenticated || !userEmail) {
      return false;
    }

    setLoading(true);
    try {
      await cartService.addToCart(
        userEmail,
        book._id,
        1,
        book.title,
        book.price
      );
      await refreshCart();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (bookId: string) => {
    if (!userEmail) return;
    setLoading(true);
    try {
      await cartService.removeFromCart(userEmail, bookId);
      await refreshCart();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (book: Book, newQuantity: number) => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      await cartService.updateCartItem(
        userEmail,
        book._id,
        newQuantity,
        book.title,
        book.price
      );
      await refreshCart();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkout = async () => {
    if (!userEmail) {
      return { success: false, message: 'Not authenticated' };
    }

    setLoading(true);
    try {
      const response = await cartService.checkout(userEmail);
      await refreshCart(); // Clear cart after successful checkout
      return response.data;
    } catch (err) {
      console.error('Checkout failed:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Checkout failed',
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    checkout,
    refreshCart,
  };
}