'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '@/lib/api';
import { CartItem } from '@/types'; 
import { useAuth } from '@/contexts/AuthContext';

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
  addToCart: (bookId: string, quantity: number, title: string, price: number) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated, userEmail } = useAuth();

  const getUserId = () => {
    // If user is authenticated, use their Cognito email (URL-encoded)
    if (isAuthenticated && userEmail) {
      return encodeURIComponent(userEmail);
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

  const refreshCart = async () => {
    try {
      const userId = getUserId();
      const response = await cartService.getCart(userId);
      const count = response.data.items?.reduce(
        (sum: number, item: CartItem) => sum + item.quantity, 
        0
      ) || 0;
      setCartCount(count);
    } catch (error) {
      console.error('Failed to refresh cart:', error);
      setCartCount(0);
    }
  };

  const addToCart = async (bookId: string, quantity: number, title: string, price: number) => {
    try {
      const userId = getUserId();
      await cartService.addToCart(userId, bookId, quantity, title, price);
      await refreshCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const clearCart = () => {
    setCartCount(0);
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated, userEmail]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}