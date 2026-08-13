import type { CategoryProductsArgs, SearchProductsArgs } from '@/src/types/catalog';

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
