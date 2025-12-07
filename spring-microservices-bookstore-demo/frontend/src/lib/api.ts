// ===========================================
// lib/api.ts - CloudShelf/BookVerse API Client
// ===========================================
// 
// This is the "bridge" between the Next.js frontend and the
// Spring Boot microservices backend running on Minikube.
//
// Key Features:
// - GraphQL client for Book Service
// - REST client for Author/Order services
// - Automatic fallback to dummy data when USE_DUMMY_DATA=true
// - Type-safe transformations between backend and frontend models
// ===========================================

import {
  Book,
  BackendBookResponse,
  BackendAuthorResponse,
  BackendOrderResponse,
  BackendReviewResponse,
  BackendUserProfileResponse,
  CartItem,
  transformBackendBook,
  transformBackendAuthor,
  transformBackendReview,
  transformBackendUserProfile,
  GraphQLResponse,
  GetAllBooksResponse,
  CreateBookResponse,
  DeleteBookResponse,
  BookInput,
  OrderInput,
  AuthorInput,
  Author,
  Review,
  User,
  SearchFilters,
  PaginatedResponse,
  BackendStockCheckResponse,
  BackendCartStockCheckResponse,
  StockInfo,
  transformBackendStockCheck,
} from '@/types';

import {
  getDummyBooks,
  searchDummyBooks,
  getDummyBooksByCategory,
  getDummyBookById,
  DUMMY_BOOKS,
} from './dummyData';

import { stringToNumberId } from './utils';
import { fetchAuthSession } from 'aws-amplify/auth';

// ===========================================
// Configuration
// ===========================================

// Helper to detect if we are running on the Server (Node.js) or Browser
const isServer = typeof window === 'undefined';

// 1. Get the Backend IP (Server-Side Only)
const SERVER_HOST = process.env.MINIKUBE_API_HOST || 'http://127.0.0.1:40029';

// 2. Determine the GraphQL Endpoint
// - Server: Talk directly to Minikube (bypassing the Proxy to avoid "Relative URL" errors)
// - Browser: Talk to the Next.js Proxy (to avoid CORS errors)
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_GATEWAY_URL || '/api/graphql';
// 3. Determine the REST Base URL
// Same logic as above
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

const USE_DUMMY_DATA = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === 'true';

// Debug logging
const DEBUG = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

function logDebug(message: string, data?: unknown) {
  if (DEBUG) {
    const env = isServer ? '[SERVER]' : '[CLIENT]';
    console.log(`${env} [API] ${message}`, data || '');
  }
}

// ===========================================
// GraphQL Client
// ===========================================

interface GraphQLRequestOptions {
  query: string;
  variables?: Record<string, unknown>;
}

// Helper to get the current JWT token securely from AWS
async function getAuthToken(): Promise<string | undefined> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  } catch (err) {
    return undefined;
  }
}

async function graphqlFetch<T>(options: GraphQLRequestOptions): Promise<GraphQLResponse<T>> {
  const { query, variables } = options;
  const token = await getAuthToken();
  
  logDebug(`GraphQL Request to ${GRAPHQL_ENDPOINT}`, { query, variables });
  
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Attaching token
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: GraphQLResponse<T> = await response.json();
    
    logDebug('GraphQL Response', data);
    
    if (data.errors && data.errors.length > 0) {
      console.error('[API] GraphQL Errors:', data.errors);
    }
    
    return data;
  } catch (error) {
    console.error('[API] GraphQL fetch failed:', error);
    throw error;
  }
}

// ===========================================
// REST Client
// ===========================================

async function restFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = await getAuthToken();
  logDebug(`REST Request to ${url}`, options);
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  logDebug('REST Response', data);
  return data;
}

// ===========================================
// Book Service (GraphQL)
// ===========================================

export const bookService = {
  /**
   * Get all books from the backend
   * Falls back to dummy data if USE_DUMMY_DATA is true or if API fails
   */
  getBooks: async (page = 1, limit = 12): Promise<{ data: PaginatedResponse<Book> }> => {
    if (USE_DUMMY_DATA) {
      logDebug('Using dummy data for getBooks');
      const dummyData = getDummyBooks(page, limit);
      return { data: dummyData };
    }

    try {
      const response = await graphqlFetch<GetAllBooksResponse>({
        query: `
          query GetAllBooks {
            getAllBooks {
              id
              name
              description
              price
            }
          }
        `,
      });

      if (response.data?.getAllBooks) {
        const books = response.data.getAllBooks.map(transformBackendBook);
        
        // Apply pagination
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedBooks = books.slice(start, end);

        return {
          data: {
            data: paginatedBooks,
            total: books.length,
            page,
            limit,
            hasMore: end < books.length,
          },
        };
      }

      // Fallback to dummy data if no books returned
      logDebug('No books from API, falling back to dummy data');
      return { data: getDummyBooks(page, limit) };
    } catch (error) {
      console.warn('[API] getBooks failed, falling back to dummy data:', error);
      return { data: getDummyBooks(page, limit) };
    }
  },

  /**
   * Get a single book by ID
   */
  getBook: async (bookId: string): Promise<{ data: Book | undefined }> => {
    // Force log to verify
    console.log(`\n[!!! DIAGNOSTIC] Fetching Book ID: ${bookId}`);
    console.log(`[!!! DIAGNOSTIC] Environment: ${typeof window === 'undefined' ? 'SERVER (Node)' : 'CLIENT (Browser)'}`);
    console.log(`[!!! DIAGNOSTIC] Target URL: ${GRAPHQL_ENDPOINT}`);

    if (USE_DUMMY_DATA) {
      const book = getDummyBookById(bookId);
      return { data: book };
    }

    try {
      const response = await graphqlFetch<GetAllBooksResponse>({
        query: `
          query GetAllBooks {
            getAllBooks {
              id
              name
              description
              price
            }
          }
        `,
      });

      if (response.data?.getAllBooks) {
        const backendBook = response.data.getAllBooks.find(b => b.id === bookId);
        
        if (backendBook) {
          console.log(`[!!! DIAGNOSTIC] ✅ Found book: ${backendBook.name}`);
          return { data: transformBackendBook(backendBook) };
        } else {
          console.error(`[!!! DIAGNOSTIC] ❌ Book ID not found in list. Available IDs:`, response.data.getAllBooks.map(b => b.id));
        }
      }
      
      return { data: getDummyBookById(bookId) };
    } catch (error) {
      console.error('[!!! DIAGNOSTIC] UNKNOWN error:', error);
      return { data: getDummyBookById(bookId) };
    }
  },

  /**
   * Alias for getBook (consistency)
   */
  getBookById: async (bookId: string) => {
    return bookService.getBook(bookId);
  },

  /**
   * Create a new book
   */
  createBook: async (book: BookInput): Promise<{ data: Book | null }> => {
    if (USE_DUMMY_DATA) {
      console.warn('[API] createBook not available in dummy data mode');
      return { data: null };
    }

    try {
      const response = await graphqlFetch<CreateBookResponse>({
        query: `
          mutation CreateBook($bookRequest: BookRequest!) {
            createBook(bookRequest: $bookRequest) {
              id
              name
              description
              price
            }
          }
        `,
        variables: {
          bookRequest: {
            name: book.name,
            description: book.description,
            price: book.price,
          },
        },
      });

      if (response.data?.createBook) {
        return { data: transformBackendBook(response.data.createBook) };
      }

      return { data: null };
    } catch (error) {
      console.error('[API] createBook failed:', error);
      return { data: null };
    }
  },

  /**
   * Delete a book by ID
   */
  deleteBook: async (bookId: string): Promise<{ data: boolean }> => {
    if (USE_DUMMY_DATA) {
      console.warn('[API] deleteBook not available in dummy data mode');
      return { data: false };
    }

    try {
      const response = await graphqlFetch<DeleteBookResponse>({
        query: `
          mutation DeleteBook($id: ID!) {
            deleteBook(id: $id)
          }
        `,
        variables: { id: bookId },
      });

      return { data: response.data?.deleteBook ?? false };
    } catch (error) {
      console.error('[API] deleteBook failed:', error);
      return { data: false };
    }
  },

  /**
   * Search books
   */
  searchBooks: async (
    query: string,
    filters?: SearchFilters
  ): Promise<{ data: PaginatedResponse<Book> }> => {
    if (USE_DUMMY_DATA) {
      let results = searchDummyBooks(query);
      
      // Apply filters
      if (filters?.category) {
        results = results.filter(book => book.category === filters.category);
      }
      if (filters?.priceRange) {
        const [min, max] = filters.priceRange;
        results = results.filter(book => book.price >= min && book.price <= max);
      }
      if (filters?.rating) {
        results = results.filter(book => book.rating >= filters.rating!);
      }
      if (filters?.inStockOnly) {
        results = results.filter(book => book.inStock);
      }
      
      // Apply sorting
      if (filters?.sortBy === 'price') {
        results.sort((a, b) => a.price - b.price);
      } else if (filters?.sortBy === 'rating') {
        results.sort((a, b) => b.rating - a.rating);
      }

      return {
        data: {
          data: results,
          total: results.length,
          page: 1,
          limit: results.length,
          hasMore: false,
        },
      };
    }

    try {
      // Backend doesn't have search, so we fetch all and filter client-side
      const response = await graphqlFetch<GetAllBooksResponse>({
        query: `
          query GetAllBooks {
            getAllBooks {
              id
              name
              description
              price
            }
          }
        `,
      });

      if (response.data?.getAllBooks) {
        const books = response.data.getAllBooks.map(transformBackendBook);
        
        // Client-side search (backend books have limited fields)
        const lowerQuery = query.toLowerCase();
        const results = books.filter(book =>
          book.title.toLowerCase().includes(lowerQuery) ||
          book.description.toLowerCase().includes(lowerQuery)
        );

        return {
          data: {
            data: results,
            total: results.length,
            page: 1,
            limit: results.length,
            hasMore: false,
          },
        };
      }

      // Fallback to dummy search
      const results = searchDummyBooks(query);
      return {
        data: {
          data: results,
          total: results.length,
          page: 1,
          limit: results.length,
          hasMore: false,
        },
      };
    } catch (error) {
      console.warn('[API] searchBooks failed, falling back to dummy data:', error);
      const results = searchDummyBooks(query);
      return {
        data: {
          data: results,
          total: results.length,
          page: 1,
          limit: results.length,
          hasMore: false,
        },
      };
    }
  },

  /**
   * Get books by category
   */
  getBooksByCategory: async (category: string): Promise<{ data: { data: Book[]; total: number } }> => {
    if (USE_DUMMY_DATA) {
      const results = getDummyBooksByCategory(category);
      return { data: { data: results, total: results.length } };
    }

    // Backend doesn't have category support
    const results = getDummyBooksByCategory(category);
    return { data: { data: results, total: results.length } };
  },
};

// ===========================================
// Author Service (REST)
// ===========================================

export const authorService = {
  /**
   * Get all authors
   */
  getAllAuthors: async (): Promise<Author[]> => {
    if (USE_DUMMY_DATA) {
      return [
        { id: '1', name: 'Erich Gamma', birthDate: '1961-03-13' },
        { id: '2', name: 'Andrew Hunt', birthDate: '1964-02-19' },
      ];
    }

    try {
      const response = await restFetch<BackendAuthorResponse[]>('/authors');
      return response.map(transformBackendAuthor);
    } catch (error) {
      console.warn('[API] getAllAuthors failed:', error);
      return [];
    }
  },

  /**
   * Create a new author
   */
  createAuthor: async (author: AuthorInput): Promise<Author | null> => {
    if (USE_DUMMY_DATA) {
      console.warn('[API] createAuthor not available in dummy data mode');
      return null;
    }

    try {
      const response = await restFetch<BackendAuthorResponse>('/authors', {
        method: 'POST',
        body: JSON.stringify(author),
      });
      return transformBackendAuthor(response);
    } catch (error) {
      console.error('[API] createAuthor failed:', error);
      return null;
    }
  },

  /**
   * Delete an author by ID
   */
  deleteAuthor: async (id: string): Promise<boolean> => {
    if (USE_DUMMY_DATA) {
      console.warn('[API] deleteAuthor not available in dummy data mode');
      return false;
    }

    try {
      await restFetch(`/authors/${id}`, { method: 'DELETE' });
      return true;
    } catch (error) {
      console.error('[API] deleteAuthor failed:', error);
      return false;
    }
  },
};

// ===========================================
// Stock Check Service (REST)
// ===========================================

export const stockService = {
  /**
   * Check stock for order placement (multiple items)
   * Endpoint: GET /api/proxy/stockcheck?skuCode=item1,item2
   * Used by: order-service
   */
  checkStock: async (skuCodes: string[]): Promise<{ data: BackendStockCheckResponse[] }> => {
    if (USE_DUMMY_DATA) {
      return {
        data: skuCodes.map(code => ({
          skuCode: code,
          isInStock: code !== 'mythical_man_month',
        })),
      };
    }

    try {
      const params = new URLSearchParams();
      skuCodes.forEach(code => params.append('skuCode', code));
      
      const response = await restFetch<BackendStockCheckResponse[]>(
        `/stockcheck?${params.toString()}`
      );
      return { data: response };
    } catch (error) {
      console.error('[API] checkStock failed:', error);
      return { data: [] };
    }
  },

  /**
   * Check stock for cart (single item with quantity)
   * Endpoint: GET /api/proxy/stock/check?bookId=xxx&quantity=1
   * Used by: cart-service, product pages
   */
  checkStockForCart: async (
    bookId: string,
    quantity: number = 1
  ): Promise<{ data: StockInfo }> => {
    if (USE_DUMMY_DATA) {
      return {
        data: {
          bookId,
          inStock: bookId !== 'mythical_man_month',
          availableQuantity: bookId === 'mythical_man_month' ? 0 : 100,
        },
      };
    }

    try {
      const response = await restFetch<BackendCartStockCheckResponse>(
        `/stock/check?bookId=${encodeURIComponent(bookId)}&quantity=${quantity}`
      );
      return { data: transformBackendStockCheck(response) };
    } catch (error) {
      console.error('[API] checkStockForCart failed:', error);
      return {
        data: {
          bookId,
          inStock: false,
          availableQuantity: 0,
        },
      };
    }
  },

  /**
   * Get available quantity for a book
   * Helper method that wraps checkStockForCart
   */
  getAvailableQuantity: async (bookId: string): Promise<number> => {
    const result = await stockService.checkStockForCart(bookId, 1);
    return result.data.availableQuantity;
  },
};


// ===========================================
// Order Service (REST)
// ===========================================

export const orderService = {
  /**
   * Place a new order
   */
  placeOrder: async (order: OrderInput): Promise<{ data: BackendOrderResponse | null }> => {
    if (USE_DUMMY_DATA) {
      return {
        data: {
          id: Date.now(),
          orderNumber: `ORD-${Date.now()}`,
          orderLineItemsDtoList: order.orderLineItemsDtoList,
        },
      };
    }

    try {
      const response = await restFetch<BackendOrderResponse>('/order', {
        method: 'POST',
        body: JSON.stringify(order),
      });
      return { data: response };
    } catch (error) {
      console.error('[API] placeOrder failed:', error);
      return { data: null };
    }
  },

  /**
   * Get order by ID
   */
  getOrderById: async (id: string): Promise<{ data: BackendOrderResponse | null }> => {
    if (USE_DUMMY_DATA) {
      return { data: null };
    }

    try {
      const response = await restFetch<BackendOrderResponse>(`/order/${id}`);
      return { data: response };
    } catch (error) {
      console.error('[API] getOrderById failed:', error);
      return { data: null };
    }
  },

  /**
   * Create a new order
   * Used by checkout page
   */
  createOrder: async (userId: string, items: any[], shippingAddress: string): Promise<{ data: { orderId: string } }> => {
    if (USE_DUMMY_DATA) {
      const orderId = `ORD-${Date.now()}`;
      return { data: { orderId } };
    }

    try {
      // Transform items to match backend format
      const orderLineItems = items.map(item => ({
        skuCode: item.bookId,
        qty: item.qty || item.quantity || 1,
      }));

      const orderData = {
        orderLineItemsDtoList: orderLineItems,
        userId,
        shippingAddress,
      };

      const response = await restFetch<BackendOrderResponse>('/order', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      return { data: { orderId: response.orderNumber || response.id.toString() } };
    } catch (error) {
      console.error('[API] createOrder failed:', error);
      throw error;
    }
  },

  /**
   * Get orders for a user
   * Used by orders page
   */
  getUserOrders: async (userId: string): Promise<{ data: any[] }> => {
    if (USE_DUMMY_DATA) {
      // Return dummy orders
      return {
        data: [
          {
            _id: '1',
            orderNumber: 'ORD-001',
            userId,
            items: [],
            status: 'delivered',
            total: 29.99,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            trackingNumber: 'TRK-12345',
          },
        ],
      };
    }

    try {
      // Backend might not have a getUserOrders endpoint
      // Return empty array for now
      console.log('[API] getUserOrders - endpoint not implemented');
      return { data: [] };
    } catch (error) {
      console.error('[API] getUserOrders failed:', error);
      return { data: [] };
    }
  },
};

// ===========================================
// Cart Service (Local/Dummy)
// ===========================================

interface BackendCartItem {
  bookId: string;
  title: string;
  quantity: number;
  price: number;
}

export const cartService = {
  getCart: async (userId: string) => {
    if (USE_DUMMY_DATA) {
      const books = getDummyBooks(1, 3).data;
      // ... keep dummy logic ...
      return { data: { userId, items: [], totalItems: 0, totalPrice: 0 } as any };
    }

    try {
      // 1. Fetch the raw data (BackendCartItem format)
      const response = await restFetch<{ 
        items: BackendCartItem[]; 
        totalPrice: number 
      }>(`/cart/${userId}`);

      // 2. Map it to the Frontend 'CartItem' format (which needs a 'book' object)
      const items: CartItem[] = (response.items || []).map((item) => ({
        bookId: item.bookId,
        // We construct a partial "Book" object so the UI can render the card
        book: {
          _id: item.bookId,
          title: item.title,
          description: '', // Not returned by Cart Service
          price: item.price,
          author: 'Unknown', // Not returned by Cart Service
          category: 'General',
          coverImage: `https://via.placeholder.com/200x300?text=${encodeURIComponent(item.title.slice(0, 15))}`,
          rating: 0,
          reviewCount: 0,
          inStock: true,
          stockCount: 10,
        },
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }));

      return {
        data: {
          userId,
          items,
          totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: response.totalPrice || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.warn('[API] getCart failed:', error);
      return { data: { userId, items: [], totalItems: 0, totalPrice: 0, createdAt: '', updatedAt: '' } };
    }
  },

  /**
   * Add item to cart
   * Endpoint: POST /api/cart/{userId}/add
   * Body: { bookId, title, quantity, price }
   */
  addToCart: async (
    userId: string,
    bookId: string,
    quantity: number,
    title: string,
    price: number
  ): Promise<{ data: { success: boolean } }> => {
    if (USE_DUMMY_DATA) {
      return { data: { success: true } };
    }

    try {
      await restFetch(`/cart/${userId}/add`, {
        method: 'POST',
        body: JSON.stringify({
          bookId,
          title,
          quantity,
          price,
        }),
      });
      return { data: { success: true } };
    } catch (error) {
      console.error('[CartService] addToCart failed:', error);
      return { data: { success: false } };
    }
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (
    userId: string,
    bookId: string,
    quantity: number,
    title: string,
    price: number
  ): Promise<{ data: { success: boolean } }> => {
    if (USE_DUMMY_DATA) {
      return { data: { success: true } };
    }

    try {
      // Remove first
      await cartService.removeCartItem(userId, bookId);
      // Re-add with new quantity
      if (quantity > 0) {
        await cartService.addToCart(userId, bookId, quantity, title, price);
      }
      return { data: { success: true } };
    } catch (error) {
      console.error('[CartService] updateCartItem failed:', error);
      return { data: { success: false } };
    }
  },

  /**
   * Remove item from cart
   * Endpoint: DELETE /api/cart/{userId}/remove/{bookId}
   */
  removeCartItem: async (
    userId: string,
    bookId: string
  ): Promise<{ data: { success: boolean } }> => {
    if (USE_DUMMY_DATA) {
      return { data: { success: true } };
    }

    try {
      await restFetch(`/cart/${userId}/remove/${bookId}`, {
        method: 'DELETE',
      });
      return { data: { success: true } };
    } catch (error) {
      console.error('[CartService] removeCartItem failed:', error);
      return { data: { success: false } };
    }
  },

  removeFromCart: async (userId: string, bookId: string) => {
    return cartService.removeCartItem(userId, bookId);
  },

  /**
   * Clear entire cart
   * Endpoint: DELETE /api/cart/{userId}/clear
   */
  clearCart: async (userId: string): Promise<{ data: { success: boolean } }> => {
    if (USE_DUMMY_DATA) {
      return { data: { success: true } };
    }

    try {
      await restFetch(`/cart/${userId}/clear`, {
        method: 'DELETE',
      });
      return { data: { success: true } };
    } catch (error) {
      console.error('[CartService] clearCart failed:', error);
      return { data: { success: false } };
    }
  },

  /**
   * Checkout cart
   * Endpoint: POST /api/cart/{userId}/checkout
   */
  checkout: async (userId: string): Promise<{
    data: { success: boolean; orderId?: string; message?: string };
  }> => {
    if (USE_DUMMY_DATA) {
      return { data: { success: true, orderId: `ORD-${Date.now()}`, message: 'Order placed!' } };
    }

    try {
      const response = await restFetch<string>(`/cart/${userId}/checkout`, {
        method: 'POST',
      });
      
      // Backend returns string like "Order placed successfully! Order Number: xyz"
      const message = typeof response === 'string' ? response : 'Order placed successfully!';
      const orderMatch = message.match(/Order Number:\s*(\S+)/i);
      
      return {
        data: {
          success: true,
          orderId: orderMatch ? orderMatch[1] : `ORD-${Date.now()}`,
          message,
        },
      };
    } catch (error) {
      console.error('[CartService] checkout failed:', error);
      return {
        data: {
          success: false,
          message: error instanceof Error ? error.message : 'Checkout failed',
        },
      };
    }
  },
};

// ===========================================
// Review Service (REST - Hisham's reviews-service)
// ===========================================
// Endpoint: /api/proxy/reviews (proxied to reviews-service)
// ===========================================

export const reviewService = {
  /**
   * Get all reviews for a specific book
   * Endpoint: GET /api/proxy/reviews/book/{bookId}
   */
  getBookReviews: async (bookId: string): Promise<{ data: Review[] }> => {
    // Dummy data for development/fallback
    const dummyReviews: Review[] = [
      {
        _id: '1',
        bookId,
        userId: 'user1',
        userName: 'John Smith',
        rating: 5,
        text: 'Absolutely loved this book! Could not put it down.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: 12,
      },
      {
        _id: '2',
        bookId,
        userId: 'user2',
        userName: 'Sarah Johnson',
        rating: 4,
        text: 'Great read with compelling content. Highly recommend!',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: 8,
      },
    ];

    if (USE_DUMMY_DATA) {
      logDebug('Using dummy data for getBookReviews');
      return { data: dummyReviews };
    }

    try {
      // ⚠️ Note: Backend expects bookId as BIGINT (Long)
      // If bookId is a MongoDB ObjectId string, this may fail
      // You may need to maintain a mapping or use a numeric ID
      const numericId = stringToNumberId(bookId);
      const backendReviews = await restFetch<BackendReviewResponse[]>(
        `/reviews/book/${numericId}`
      );

      // Transform backend responses to frontend format
      const reviews = backendReviews.map((review) => 
        transformBackendReview(review, 'Anonymous User')
      );

      logDebug(`Fetched ${reviews.length} reviews for book ${bookId}`);
      return { data: reviews };
    } catch (error) {
      console.warn('[API] getBookReviews failed, falling back to dummy data:', error);
      return { data: dummyReviews };
    }
  },

  /**
   * Get average rating for a book
   * Endpoint: GET /api/proxy/reviews/book/{bookId}/average-rating
   */
  getBookRatings: async (bookId: string) => {
    const dummyRating = {
      bookId,
      averageRating: 4.5,
      totalRatings: 127,
      distribution: { 5: 80, 4: 30, 3: 12, 2: 3, 1: 2 },
    };

    if (USE_DUMMY_DATA) {
      logDebug('Using dummy data for getBookRatings');
      return { data: dummyRating };
    }

    try {
      const response = await restFetch<{ bookId: number; averageRating: number }>(
        `/reviews/book/${bookId}/average-rating`
      );

      return {
        data: {
          bookId: response.bookId.toString(),
          averageRating: response.averageRating,
          totalRatings: 0, // Not provided by backend
          distribution: {}, // Not provided by backend
        },
      };
    } catch (error) {
      console.warn('[API] getBookRatings failed, falling back to dummy data:', error);
      return { data: dummyRating };
    }
  },

  /**
   * Create a new review
   * Endpoint: POST /api/proxy/reviews
   * 
   * Backend expects: { book_id: number, user_id: number, rating: number, comment: string }
   */
  createReview: async (
    bookId: string,
    userId: string,
    rating: number,
    text: string
  ) => {
    if (USE_DUMMY_DATA) {
      return { 
        data: { 
          success: true,
          reviewId: `review-${Date.now()}`,
        } 
      };
    }

    try {
      const payload = {
        bookId: stringToNumberId(bookId),
        userId: stringToNumberId(userId),
        rating,
        comment: text,
      };

      logDebug('Creating review with payload:', payload);

      const response = await restFetch<BackendReviewResponse>('/reviews', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return { 
        data: { 
          success: true,
          reviewId: response.id.toString(),
        } 
      };
    } catch (error) {
      console.error('[API] createReview failed:', error);
      return { 
        data: { 
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create review',
        } 
      };
    }
  },

  /**
   * Delete a review
   * Endpoint: DELETE /api/proxy/reviews/{id}
   */
  deleteReview: async (reviewId: string): Promise<{ data: { success: boolean } }> => {
    if (USE_DUMMY_DATA) {
      logDebug('Using dummy data for deleteReview');
      return { data: { success: true } };
    }

    try {
      await restFetch<void>(`/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      return { data: { success: true } };
    } catch (error) {
      console.error('[API] deleteReview failed:', error);
      return { data: { success: false } };
    }
  },
};

// ===========================================
// Recommendation Service (Now using REAL data)
// ===========================================

export const recommendationService = {
  getUserRecommendations: async (_userId: string) => {
    // FIX: Fetch REAL books from the backend instead of dummy data
    // This ensures the IDs actually exist when you click them.
    try {
      // Just fetch the first 4 real books as "recommendations"
      const realBooks = await bookService.getBooks(1, 4);
      return { data: realBooks.data.data };
    } catch (error) {
      console.warn('Failed to fetch real recommendations:', error);
      return { data: [] };
    }
  },

  getSimilarBooks: async (_bookId: string) => {
    // FIX: Just fetch random real books
    try {
      const realBooks = await bookService.getBooks(1, 4);
      return { data: realBooks.data.data };
    } catch (error) {
      return { data: [] };
    }
  },

  getBookRecommendations: async (bookId: string) => {
    return recommendationService.getSimilarBooks(bookId);
  },
};

// ===========================================
// Search Service (Convenience Wrapper)
// ===========================================

export const searchService = {
  search: async (query: string, filters?: SearchFilters) => {
    return bookService.searchBooks(query, filters);
  },

  getBooksByCategory: async (category: string) => {
    return bookService.getBooksByCategory(category);
  },
};

// ===========================================
// User Profile Service (REST - Hisham's user-profile-service)
// ===========================================
// Endpoint: /api/proxy/profiles (proxied to user-profile-service)
//
// Backend Schema (PostgreSQL):
// - id: BIGSERIAL PK
// - first_name: VARCHAR(255)
// - last_name: VARCHAR(255)
// - email: VARCHAR(255) UNIQUE
// - phone: VARCHAR(255)
// - address: VARCHAR(255)
// - city: VARCHAR(255)
// - country: VARCHAR(255)
// ===========================================

export const userService = {
  /**
   * Get user profile by ID
   * Profile service doesn't exist in backend - return dummy data
   * The userId (email) is still used for identification
   */
  getProfile: async (userId: string): Promise<{ data: User }> => {
    // Profile service doesn't exist in backend - return dummy data
    // The userId (email) is still used for identification
    const decodedUserId = decodeURIComponent(userId);
    const dummyUser: User = {
      _id: decodedUserId,
      email: decodedUserId.includes('@') ? decodedUserId : `${decodedUserId}@example.com`,
      name: decodedUserId.includes('@') ? decodedUserId.split('@')[0] : 'User',
      firstName: decodedUserId.includes('@') ? decodedUserId.split('@')[0] : 'User',
      lastName: 'Doe',
      avatar: undefined,
      phone: '555-123-4567',
      addresses: [
        {
          _id: '1',
          street: '123 Main St',
          city: 'Huntington Beach',
          state: 'CA',
          postalCode: '92648',
          country: 'United States',
          isDefault: true,
        },
      ],
      wishlist: ['1', '2', '3'],
      preferences: {
        favoriteCategories: ['Fiction', 'Science Fiction'],
        notifications: true,
        newsletter: true,
      },
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return { data: dummyUser };
  },

  /**
   * Get all user profiles
   * Endpoint: GET /api/proxy/profiles
   */
  getAllProfiles: async (): Promise<{ data: User[] }> => {
    if (USE_DUMMY_DATA) {
      logDebug('Using dummy data for getAllProfiles');
      return { data: [] };
    }

    try {
      const backendProfiles = await restFetch<BackendUserProfileResponse[]>(
        '/profiles'
      );

      const users = backendProfiles.map(transformBackendUserProfile);
      logDebug(`Fetched ${users.length} profiles`);
      return { data: users };
    } catch (error) {
      console.warn('[API] getAllProfiles failed:', error);
      return { data: [] };
    }
  },

  /**
   * Create a new user profile
   * Endpoint: POST /api/proxy/profiles
   */
  createProfile: async (profileData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  }): Promise<{ data: { success: boolean; userId?: string } }> => {
    if (USE_DUMMY_DATA) {
      logDebug('Using dummy data for createProfile');
      return { data: { success: true, userId: `user-${Date.now()}` } };
    }

    try {
      // Transform to backend expected format (snake_case)
      const payload = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone || null,
        address: profileData.address || null,
        city: profileData.city || null,
        country: profileData.country || null,
      };

      logDebug('Creating profile with payload:', payload);

      const response = await restFetch<BackendUserProfileResponse>(
        '/profiles',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      return {
        data: {
          success: true,
          userId: response.id.toString(),
        },
      };
    } catch (error) {
      console.error('[API] createProfile failed:', error);
      return { data: { success: false } };
    }
  },

  /**
   * Update user profile
   * Profile service doesn't exist - just return success
   * In a real app, this would persist to a backend
   */
  updateProfile: async (
    userId: string,
    updates: any
  ): Promise<{ data: { success: boolean } }> => {
    // Profile service doesn't exist - just return success
    // In a real app, this would persist to a backend
    console.log('Profile update (dummy):', userId, updates);
    return { data: { success: true } };
  },

  /**
   * Delete user profile
   * Endpoint: DELETE /api/proxy/profiles/{userId}
   */
  deleteProfile: async (userId: string): Promise<{ data: { success: boolean } }> => {
    if (USE_DUMMY_DATA) {
      logDebug('Using dummy data for deleteProfile');
      return { data: { success: true } };
    }

    try {
      await restFetch<void>(`/profiles/${userId}`, {
        method: 'DELETE',
      });
      return { data: { success: true } };
    } catch (error) {
      console.error('[API] deleteProfile failed:', error);
      return { data: { success: false } };
    }
  },

  /**
   * Get user's wishlist (Local storage / dummy implementation)
   * Note: Not implemented in Hisham's backend
   */
  getWishlist: async (_userId: string) => {
    const books = getDummyBooks(1, 4).data;
    return { data: books.map(b => b._id) };
  },

  /**
   * Add book to wishlist (Local storage / dummy implementation)
   * Note: Not implemented in Hisham's backend
   */
  addToWishlist: async (_userId: string, _bookId: string) => {
    return { data: { success: true } };
  },

  /**
   * Remove book from wishlist (Local storage / dummy implementation)
   * Note: Not implemented in Hisham's backend
   */
  removeFromWishlist: async (_userId: string, _bookId: string) => {
    return { data: { success: true } };
  },
};

// ===========================================
// Pricing Service (Deprecated, handled by bookservice)
// ===========================================

export const pricingService = {
  getQuote: async (bookId: string, _userId: string, qty: number, coupon?: string) => {
    const book = getDummyBookById(bookId);
    const price = book ? book.price * qty : 0;
    const discount = coupon ? 5.0 : 0;
    return {
      data: {
        price,
        discount,
        total: price - discount,
      },
    };
  },

  validateCoupon: async (code: string, _userId: string) => {
    const validCoupons = ['SAVE10', 'WELCOME', 'BOOKWORM'];
    const isValid = validCoupons.includes(code.toUpperCase());
    return {
      data: {
        valid: isValid,
        discountAmount: isValid ? 10.0 : 0,
        discountPercent: isValid ? 10 : 0,
      },
    };
  },
};

// ===========================================
// Shipping Service (Dummy)
// ===========================================

export const shippingService = {
  /**
   * Get shipping quote
   * Used by checkout page
   */
  getShippingQuote: async (orderId: string, address: any) => {
    // Shipping service is dummy - return mock shipping rates
    return {
      data: {
        orderId,
        address,
        standardShipping: 5.99,
        expressShipping: 15.99,
        freeShippingThreshold: 50,
        estimatedDeliveryStandard: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedDeliveryExpress: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  },

  /**
   * Get tracking information
   * Alias for trackShipment
   */
  getTracking: async (trackingNumber: string) => {
    return shippingService.trackShipment(trackingNumber);
  },

  /**
   * Track shipment
   */
  trackShipment: async (trackingNumber: string) => {
    return {
      data: {
        trackingNumber,
        status: 'in_transit',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        events: [
          {
            status: 'Package received by carrier',
            location: 'San Francisco, CA',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            status: 'Out for delivery',
            location: 'Huntington Beach, CA',
            timestamp: new Date().toISOString(),
          },
        ],
      },
    };
  },
};

// ===========================================
// Payment Service (Dummy)
// ===========================================

export const paymentService = {
  /**
   * Create payment intent
   * Used by checkout page
   */
  createPaymentIntent: async (orderId: string, amount: number, currency: string) => {
    // Payment service is dummy - return mock intent
    return {
      data: {
        intentId: `pi_${Date.now()}`,
        orderId,
        amount,
        currency,
        status: 'requires_confirmation',
      },
    };
  },

  /**
   * Confirm payment
   * Used by checkout page
   */
  confirmPayment: async (intentId: string, paymentMethod: string) => {
    // Payment service is dummy - return success
    return {
      data: {
        intentId,
        paymentMethod,
        status: 'succeeded',
      },
    };
  },
};

// ===========================================
// Auth Service
// ===========================================

export const authService = {
  login: async (_email: string, _password: string) => {
    // This should be handled by AWS Cognito/Amplify
    throw new Error('Use AWS Amplify for authentication');
  },

  register: async (_email: string, _password: string, _name: string) => {
    // This should be handled by AWS Cognito/Amplify
    throw new Error('Use AWS Amplify for authentication');
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },
};

// Default export for backward compatibility
export default {
  bookService,
  authorService,
  orderService,
  cartService,
  reviewService,
  recommendationService,
  searchService,
  userService,
  pricingService,
  shippingService,
  paymentService,
  authService,
};
