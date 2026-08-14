import type {
  CreateReviewResponse,
  ProductReview,
  ProductReviewsResponse,
  ReviewableItem,
  ReviewableItemsResponse,
} from '@/src/types/review';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

export function normalizeProductReview(raw: unknown): ProductReview | null {
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }
  const id = asString(rec.id) ?? asString(rec.reviewId);
  const rating = asNumber(rec.rating);
  if (!id || typeof rating !== 'number') {
    return null;
  }

  return {
    id,
    rating,
    text: asString(rec.text) ?? asString(rec.body) ?? asString(rec.comment) ?? null,
    createdAt: asString(rec.createdAt) ?? asString(rec.created_at) ?? null,
    createdAtLabel: asString(rec.createdAtLabel) ?? null,
    reviewerDisplayName:
      asString(rec.reviewerDisplayName) ??
      asString(rec.displayName) ??
      asString(rec.reviewerName) ??
      asString(rec.customerName) ??
      null,
  };
}

function dedupeReviewsById(items: ProductReview[]): ProductReview[] {
  const seen = new Set<string>();
  const unique: ProductReview[] = [];
  for (const item of items) {
    if (!item.id || seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    unique.push(item);
  }
  return unique;
}

export function normalizeProductReviewsResponse(
  response: unknown,
  requestedPage?: number,
): ProductReviewsResponse {
  const root = asRecord(response) ?? {};
  const data = asRecord(root.data) ?? root;
  const rawItems = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.reviews)
      ? data.reviews
      : [];
  const items: ProductReview[] = [];
  for (const item of rawItems) {
    const review = normalizeProductReview(item);
    if (review) {
      items.push(review);
    }
  }

  const parsedPage = asNumber(data.page);
  const page =
    typeof parsedPage === 'number' && parsedPage > 0
      ? parsedPage
      : typeof requestedPage === 'number' && requestedPage > 0
        ? requestedPage
        : 1;

  return {
    items: dedupeReviewsById(items),
    page,
    pageSize: asNumber(data.pageSize) ?? 0,
    total: asNumber(data.total) ?? items.length,
    hasMore: asBoolean(data.hasMore) ?? false,
    ratingAverage: asNumber(data.ratingAverage) ?? asNumber(root.ratingAverage) ?? null,
    ratingCount: asNumber(data.ratingCount) ?? asNumber(root.ratingCount) ?? null,
  };
}

export function mergeReviewListPages(
  currentCache: ProductReviewsResponse | undefined,
  incoming: ProductReviewsResponse,
): ProductReviewsResponse {
  if (incoming.page <= 1) {
    return {
      ...incoming,
      items: dedupeReviewsById(incoming.items),
    };
  }

  return {
    ...incoming,
    items: dedupeReviewsById([...(currentCache?.items ?? []), ...incoming.items]),
  };
}

export function reviewsListCacheKey(args: { productId: string; page?: number }): {
  productId: string;
} {
  return { productId: args.productId };
}

export function normalizeReviewableItems(response: unknown): ReviewableItemsResponse {
  const root = asRecord(response) ?? {};
  const data = asRecord(root.data) ?? root;
  const rawItems = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.reviewableItems)
      ? data.reviewableItems
      : [];
  const items: ReviewableItem[] = [];
  for (const item of rawItems) {
    const rec = asRecord(item);
    if (!rec) {
      continue;
    }
    const orderItemId = asString(rec.orderItemId) ?? asString(rec.id);
    if (!orderItemId) {
      continue;
    }
    items.push({
      orderItemId,
      productId: asString(rec.productId),
      productName: asString(rec.productName) ?? asString(rec.name) ?? null,
    });
  }
  return { items };
}

export function normalizeCreateReviewResponse(response: unknown): CreateReviewResponse {
  const rec = asRecord(response) ?? {};
  const data = asRecord(rec.data) ?? rec;
  return {
    id: asString(data.id) ?? asString(data.reviewId),
    status: asString(data.status) ?? asString(data.moderationStatus) ?? null,
  };
}

export function isReviewPendingModeration(status: string | null | undefined): boolean {
  if (!status) {
    return false;
  }
  const normalized = status.trim().toLowerCase();
  return (
    normalized === 'pending' ||
    normalized === 'submitted' ||
    normalized === 'moderation' ||
    normalized === 'awaiting_approval' ||
    normalized === 'in_review'
  );
}

export function formatReviewDate(
  iso: string | null | undefined,
  label?: string | null,
): string | null {
  if (label?.trim()) {
    return label.trim();
  }
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
