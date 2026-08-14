import type { ProductSummary } from '@/src/types/commerce';
import type {
  CategoryProductsArgs,
  ProductListResponse,
  SearchProductsArgs,
} from '@/src/types/catalog';

type ListQueryArgs = Omit<CategoryProductsArgs, 'categoryId'> | Omit<SearchProductsArgs, 'q'>;

/** Build RTK Query `params` from shared catalogue filter/sort/page state. */
export function buildCatalogQueryParams(args: ListQueryArgs): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (typeof args.page === 'number' && args.page > 0) {
    params.page = args.page;
  }
  if (args.sort) {
    params.sort = args.sort;
  }
  if (typeof args.priceMin === 'number') {
    params.priceMin = args.priceMin;
  }
  if (typeof args.priceMax === 'number') {
    params.priceMax = args.priceMax;
  }
  if ('subcategory' in args && args.subcategory) {
    params.subcategory = args.subcategory;
  }
  if (args.filters) {
    for (const [key, value] of Object.entries(args.filters)) {
      if (value) {
        params[key] = value;
      }
    }
  }

  return params;
}

/** Cache key without page so pages can merge into one list entry. */
export function catalogListCacheKey<T extends { page?: number }>(args: T): Omit<T, 'page'> {
  const { page: _page, ...rest } = args;
  return rest;
}

export function dedupeProductsById(items: ProductSummary[]): ProductSummary[] {
  const seen = new Set<string>();
  const unique: ProductSummary[] = [];
  for (const item of items) {
    if (!item?.id || seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    unique.push(item);
  }
  return unique;
}

/**
 * Prefer the request page when the payload omits `page`.
 * Page ≤ 1 replaces; later pages append new ids only.
 */
export function normalizeProductListResponse(
  response: Partial<ProductListResponse> | undefined,
  requestedPage?: number,
): ProductListResponse {
  const page =
    typeof response?.page === 'number' && response.page > 0
      ? response.page
      : typeof requestedPage === 'number' && requestedPage > 0
        ? requestedPage
        : 1;

  return {
    items: dedupeProductsById(response?.items ?? []),
    page,
    pageSize: response?.pageSize ?? 0,
    total: response?.total ?? 0,
    hasMore: Boolean(response?.hasMore),
    category: response?.category ?? null,
    availableFilters: response?.availableFilters,
    availableSorts: response?.availableSorts,
  };
}

export function mergeProductListPages(
  currentCache: ProductListResponse | undefined,
  incoming: ProductListResponse,
): ProductListResponse {
  if (incoming.page <= 1) {
    return {
      ...incoming,
      items: dedupeProductsById(incoming.items),
    };
  }

  return {
    ...incoming,
    items: dedupeProductsById([...(currentCache?.items ?? []), ...incoming.items]),
  };
}
