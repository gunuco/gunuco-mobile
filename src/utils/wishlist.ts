import type { ProductSummary } from '@/src/types/commerce';
import type { WishlistResponse } from '@/src/types/wishlist';

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

function normalizeWishlistProduct(raw: unknown): ProductSummary | null {
  const rec = asRecord(raw);
  const product = rec ? (asRecord(rec.product) ?? rec) : null;
  if (!product) {
    return null;
  }

  const id = asString(product.id) ?? asString(product.productId);
  const name = asString(product.name);
  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    imageUrl: asString(product.imageUrl) ?? null,
    pricePaise: asNumber(product.pricePaise) ?? 0,
    compareAtPricePaise: asNumber(product.compareAtPricePaise) ?? null,
    ratingAverage: asNumber(product.ratingAverage) ?? null,
    ratingCount: asNumber(product.ratingCount) ?? null,
    isPremium: asBoolean(product.isPremium),
    isAvailable: asBoolean(product.isAvailable),
    discountLabel: asString(product.discountLabel) ?? null,
    isWishlisted: true,
  };
}

export function normalizeWishlistResponse(response: unknown): WishlistResponse {
  const root = asRecord(response) ?? {};
  const data = asRecord(root.data) ?? root;
  const rawItems = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.products)
      ? data.products
      : Array.isArray(root.items)
        ? root.items
        : [];

  const items: ProductSummary[] = [];
  const seen = new Set<string>();
  for (const item of rawItems) {
    const product = normalizeWishlistProduct(item);
    if (!product || seen.has(product.id)) {
      continue;
    }
    seen.add(product.id);
    items.push(product);
  }

  return { items };
}

export function wishlistContains(items: ProductSummary[] | undefined, productId: string): boolean {
  return Boolean(items?.some((item) => item.id === productId));
}
