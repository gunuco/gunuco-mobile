import { productApi } from '@/src/store/api/productApi';
import type { RootState } from '@/src/store/store';
import type { ProductSummary } from '@/src/types/commerce';
import type {
  AddCartItemPayload,
  ProductDetail,
  ProductOptionsResponse,
} from '@/src/types/product';
import type { WishlistResponse } from '@/src/types/wishlist';
import { isNotFoundError } from './errors';
import {
  buildDefaultSelection,
  canSubmitProductConfiguration,
  toCartOptions,
} from './productDetail';

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
    hasRequiredOptions: normalizeHasRequiredOptions(product),
    weightLabel: asString(product.weightLabel) ?? asString(product.weight) ?? null,
    badgeLabel: asString(product.badgeLabel) ?? asString(product.badge) ?? null,
  };
}

/**
 * Reads option-requirement from wishlist payload only. Never fetches
 * GET /products/{id}/options. Unknown → undefined (open Product Details).
 */
function normalizeHasRequiredOptions(product: Record<string, unknown>): boolean | undefined {
  const explicit =
    asBoolean(product.hasRequiredOptions) ??
    asBoolean(product.requiresOptions) ??
    asBoolean(product.requiresConfiguration);
  if (explicit !== undefined) {
    return explicit;
  }

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return true;
  }

  const rawGroups = product.optionGroups ?? product.options ?? product.optionSchema;
  if (!Array.isArray(rawGroups)) {
    return undefined;
  }

  return rawGroups.some((group) => asRecord(group)?.required === true);
}

export type WishlistCartDecision =
  { action: 'add'; payload: AddCartItemPayload } | { action: 'configure' };

/**
 * Cache lookup only — does not start GET /products/{id} or GET /products/{id}/options.
 * A prior Product Details visit may already have this data in RTK Query cache.
 */
export function readCachedWishlistCartSources(
  state: RootState,
  productId: string,
): {
  cachedDetail?: ProductDetail;
  cachedOptions?: ProductOptionsResponse;
} {
  const productResult = productApi.endpoints.getProduct.select(productId)(state);
  const optionsResult = productApi.endpoints.getProductOptions.select(productId)(state);
  const cachedDetail = productResult.status === 'fulfilled' ? productResult.data : undefined;

  if (optionsResult.status === 'fulfilled' && optionsResult.data) {
    return { cachedDetail, cachedOptions: optionsResult.data };
  }

  if (optionsResult.status === 'rejected' && isNotFoundError(optionsResult.error)) {
    return { cachedDetail, cachedOptions: { groups: [] } };
  }

  return { cachedDetail };
}

/**
 * Decide whether Wishlist can POST /cart/items immediately.
 * If requirement cannot be proven without a new options request, returns `configure`.
 */
export function resolveWishlistCartAdd(args: {
  product: ProductSummary;
  cachedDetail?: ProductDetail;
  cachedOptions?: ProductOptionsResponse;
}): WishlistCartDecision {
  const productId = args.product.id;

  if (args.cachedOptions) {
    const selection = buildDefaultSelection(args.cachedOptions.groups);
    if (
      !canSubmitProductConfiguration(
        args.cachedOptions.groups,
        selection,
        args.cachedOptions.variants,
      )
    ) {
      return { action: 'configure' };
    }
    return {
      action: 'add',
      payload: {
        productId,
        quantity: 1,
        options: toCartOptions(selection),
      },
    };
  }

  const requiredFlag = args.product.hasRequiredOptions ?? args.cachedDetail?.hasRequiredOptions;
  if (requiredFlag === true) {
    return { action: 'configure' };
  }

  if (requiredFlag === false) {
    return {
      action: 'add',
      payload: {
        productId,
        quantity: 1,
        options: [],
      },
    };
  }

  return { action: 'configure' };
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
