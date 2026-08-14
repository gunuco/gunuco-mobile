export type ProductReview = {
  id: string;
  rating: number;
  text?: string | null;
  createdAt?: string | null;
  createdAtLabel?: string | null;
  reviewerDisplayName?: string | null;
};

export type ProductReviewsArgs = {
  productId: string;
  page?: number;
};

export type ProductReviewsResponse = {
  items: ProductReview[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  ratingAverage?: number | null;
  ratingCount?: number | null;
};

export type ReviewableItem = {
  orderItemId: string;
  productId?: string;
  productName?: string | null;
};

export type ReviewableItemsResponse = {
  items: ReviewableItem[];
};

export type CreateReviewPayload = {
  orderItemId: string;
  rating: number;
  text: string;
  /** Cache invalidation only — not sent to POST /reviews. */
  productId?: string;
};

export type CreateReviewResponse = {
  id?: string;
  status?: string | null;
};
