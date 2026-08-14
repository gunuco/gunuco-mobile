import type { ProductSummary } from './commerce';

export type WishlistItem = ProductSummary;

export type WishlistResponse = {
  items: WishlistItem[];
};
