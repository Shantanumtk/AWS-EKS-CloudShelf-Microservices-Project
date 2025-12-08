import { Book } from '@/types';

export const DUMMY_BOOKS: Book[] = [
  {
    _id: '1',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'A classic novel about racial injustice in the American South, seen through the eyes of young Scout Finch. Harper Lee\'s Pulitzer Prize-winning masterpiece explores themes of morality, innocence, and the loss of childhood.',
    price: 14.99,
    category: 'Fiction',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg',
    rating: 4.8,
    reviewCount: 5234,
    inStock: true,
    stockCount: 50,
    isbn: '9780061120084',
    publisher: 'Harper Perennial',
    publishedDate: '1960-07-11',
    tags: ['Classic', 'American Literature', 'Coming of Age']
  },
  {
    _id: '2',
    title: '1984',
    author: 'George Orwell',
    description: 'George Orwell\'s dystopian masterpiece about a totalitarian regime that controls every aspect of life. A chilling exploration of surveillance, propaganda, and the manipulation of truth.',
    price: 13.99,
    category: 'Science Fiction',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
    rating: 4.7,
    reviewCount: 8921,
    inStock: true,
    stockCount: 75,
    isbn: '9780451524935',
    publisher: 'Signet Classics',
    publishedDate: '1949-06-08',
    tags: ['Dystopian', 'Classic', 'Political Fiction']
  },
  {
    _id: '3',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'Jane Austen\'s beloved romantic novel following Elizabeth Bennet as she navigates issues of manners, morality, and marriage in early 19th-century England.',
    price: 12.99,
    category: 'Romance',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
    rating: 4.6,
    reviewCount: 6543,
    inStock: true,
    stockCount: 60,
    isbn: '9780141439518',
    publisher: 'Penguin Classics',
    publishedDate: '1813-01-28',
    tags: ['Classic', 'Romance', 'British Literature']
  },
  {
    _id: '4',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'F. Scott Fitzgerald\'s iconic portrayal of the Jazz Age, following the mysterious millionaire Jay Gatsby and his obsessive pursuit of the American Dream.',
    price: 11.99,
    category: 'Fiction',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
    rating: 4.5,
    reviewCount: 7234,
    inStock: true,
    stockCount: 80,
    isbn: '9780743273565',
    publisher: 'Scribner',
    publishedDate: '1925-04-10',
    tags: ['Classic', 'American Literature', 'Jazz Age']
  },
  {
    _id: '5',
    title: 'One Hundred Years of Solitude',
    author: 'Gabriel García Márquez',
    description: 'Gabriel García Márquez\'s magical realist epic chronicling seven generations of the Buendía family in the fictional town of Macondo. A landmark of world literature.',
    price: 16.99,
    category: 'Fiction',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780060883287-L.jpg',
    rating: 4.7,
    reviewCount: 4567,
    inStock: true,
    stockCount: 40,
    isbn: '9780060883287',
    publisher: 'Harper Perennial',
    publishedDate: '1967-05-30',
    tags: ['Magical Realism', 'Classic', 'Latin American Literature']
  },
  {
    _id: '6',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    description: 'The story of Holden Caulfield, a teenage boy dealing with complex issues of identity, belonging, and loss in post-war America.',
    price: 12.99,
    category: 'Fiction',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg',
    rating: 4.3,
    reviewCount: 5678,
    inStock: true,
    stockCount: 55,
    isbn: '9780316769488',
    publisher: 'Little, Brown and Company',
    publishedDate: '1951-07-16',
    tags: ['Classic', 'Coming of Age', 'American Literature']
  },
  {
    _id: '7',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'An unexpected adventure begins when a reluctant hobbit embarks on a quest to reclaim treasure guarded by a dragon.',
    price: 15.99,
    category: 'Fantasy',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg',
    rating: 4.8,
    reviewCount: 9123,
    inStock: true,
    stockCount: 90,
    isbn: '9780547928227',
    publisher: 'Mariner Books',
    publishedDate: '1937-09-21',
    tags: ['Fantasy', 'Adventure', 'Classic']
  },
  {
    _id: '8',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    description: 'A dystopian vision of a future society controlled through pleasure, technology, and conditioning rather than fear and oppression.',
    price: 14.99,
    category: 'Science Fiction',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg',
    rating: 4.4,
    reviewCount: 4321,
    inStock: true,
    stockCount: 45,
    isbn: '9780060850524',
    publisher: 'Harper Perennial',
    publishedDate: '1932-01-01',
    tags: ['Dystopian', 'Classic', 'Science Fiction']
  },
  {
    _id: '9',
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    description: 'The story of a strong-willed orphan who becomes a governess and falls in love with her mysterious employer, Mr. Rochester.',
    price: 11.99,
    category: 'Romance',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780141441146-L.jpg',
    rating: 4.5,
    reviewCount: 3987,
    inStock: true,
    stockCount: 35,
    isbn: '9780141441146',
    publisher: 'Penguin Classics',
    publishedDate: '1847-10-16',
    tags: ['Classic', 'Romance', 'Gothic']
  },
  {
    _id: '10',
    title: 'Wuthering Heights',
    author: 'Emily Brontë',
    description: 'A wild, passionate story of the intense love between Catherine Earnshaw and Heathcliff on the Yorkshire moors.',
    price: 10.99,
    category: 'Romance',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780141439556-L.jpg',
    rating: 4.3,
    reviewCount: 3456,
    inStock: true,
    stockCount: 30,
    isbn: '9780141439556',
    publisher: 'Penguin Classics',
    publishedDate: '1847-12-01',
    tags: ['Classic', 'Romance', 'Gothic']
  },
  {
    _id: '11',
    title: 'Crime and Punishment',
    author: 'Fyodor Dostoevsky',
    description: 'A psychological exploration of guilt and redemption following a young man who commits a terrible crime.',
    price: 13.99,
    category: 'Fiction',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780143058144-L.jpg',
    rating: 4.6,
    reviewCount: 4123,
    inStock: true,
    stockCount: 25,
    isbn: '9780143058144',
    publisher: 'Penguin Classics',
    publishedDate: '1866-01-01',
    tags: ['Classic', 'Russian Literature', 'Psychological']
  },
  {
    _id: '12',
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    description: 'The epic fantasy trilogy following the quest to destroy the One Ring and save Middle-earth from darkness.',
    price: 29.99,
    category: 'Fantasy',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780618640157-L.jpg',
    rating: 4.9,
    reviewCount: 12345,
    inStock: true,
    stockCount: 100,
    isbn: '9780618640157',
    publisher: 'Mariner Books',
    publishedDate: '1954-07-29',
    tags: ['Fantasy', 'Epic', 'Classic']
  }
];

// Function to get dummy books with pagination
export const getDummyBooks = (page: number = 1, limit: number = 12) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedBooks = DUMMY_BOOKS.slice(start, end);

  return {
    data: paginatedBooks,
    total: DUMMY_BOOKS.length,
    page,
    limit,
    hasMore: end < DUMMY_BOOKS.length,
  };
};

// Function to calculate Levenshtein distance (edit distance) between two strings
const levenshteinDistance = (str1: string, str2: string): number => {
  const len1 = str1.length;
  const len2 = str2.length;
  
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  return matrix[len1][len2];
};

// Calculate similarity score (0 to 1, where 1 is perfect match)
const calculateSimilarity = (str1: string, str2: string): number => {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
};

// Calculate relevance score for ranking results
const calculateRelevanceScore = (book: Book, query: string): number => {
  const lowerQuery = query.toLowerCase();
  let score = 0;
  
  if (book.title.toLowerCase().includes(lowerQuery)) score += 100;
  if (book.author.toLowerCase().includes(lowerQuery)) score += 80;
  if (book.description.toLowerCase().includes(lowerQuery)) score += 30;
  
  const queryWords = lowerQuery.split(/\s+/);
  const titleWords = book.title.toLowerCase().split(/\s+/);
  const authorWords = book.author.toLowerCase().split(/\s+/);
  
  queryWords.forEach(queryWord => {
    titleWords.forEach(titleWord => {
      const similarity = calculateSimilarity(queryWord, titleWord);
      if (similarity >= 0.6) score += similarity * 40;
    });
    
    authorWords.forEach(authorWord => {
      const similarity = calculateSimilarity(queryWord, authorWord);
      if (similarity >= 0.6) score += similarity * 30;
    });
    
    if (book.tags) {
      book.tags.forEach((tag: string) => {
        const similarity = calculateSimilarity(queryWord, tag.toLowerCase());
        if (similarity >= 0.6) score += similarity * 20;
      });
    }
  });
  
  if (book.title.toLowerCase().startsWith(lowerQuery)) score += 50;
  if (book.author.toLowerCase().startsWith(lowerQuery)) score += 40;
  
  score += book.rating * 2;
  score += Math.log(book.reviewCount + 1) * 1;
  
  return score;
};

// Enhanced search function with fuzzy matching
export const searchDummyBooks = (query: string) => {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const lowerQuery = query.toLowerCase().trim();
  const queryWords = lowerQuery.split(/\s+/);
  
  const scoredBooks = DUMMY_BOOKS.map(book => ({
    book,
    score: calculateRelevanceScore(book, query)
  }));
  
  const results = scoredBooks
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.book);
  
  if (results.length === 0) {
    return DUMMY_BOOKS.filter(book => {
      const searchText = `${book.title} ${book.author} ${book.description} ${book.tags?.join(' ')}`.toLowerCase();
      return queryWords.some(word => searchText.includes(word));
    });
  }
  
  return results;
};

// Function to get books by category
export const getDummyBooksByCategory = (category: string) => {
  return DUMMY_BOOKS.filter(
    (book) => book.category.toLowerCase() === category.toLowerCase()
  );
};

// Function to get a single book by ID
export const getDummyBookById = (id: string) => {
  return DUMMY_BOOKS.find((book) => book._id === id);
};