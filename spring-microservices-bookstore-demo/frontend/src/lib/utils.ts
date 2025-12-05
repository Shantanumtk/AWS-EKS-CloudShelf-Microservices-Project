export const formatPrice = (price: number | undefined | null): string => {
  if (price === undefined || price === null) {
    return '$0.00'; // or return 'Price unavailable'
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};
