import type { CategorySummary, ProductSummary } from './commerce';

/** Approved catalogue sort keys from product decisions / API docs. */
export type ProductSort = 'popular' | 'price_asc' | 'price_desc' | 'newest';

export type CategoryNode = CategorySummary & {
  slug?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  children?: CategoryNode[];
};

export type CategoriesResponse = {
  categories: CategoryNode[];
};

export type CatalogFilterOption = {
  id: string;
  label: string;
  value: string;
};

export type CatalogFilterGroup = {
  id: string;
  label: string;
  type: 'single' | 'multi' | 'range';
  options?: CatalogFilterOption[];
  minPaise?: number | null;
  maxPaise?: number | null;
};

export type CatalogSortOption = {
  id: ProductSort | string;
  label: string;
};

export type ProductListResponse = {
  items: ProductSummary[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  category?: CategorySummary | null;
  availableFilters?: CatalogFilterGroup[];
  availableSorts?: CatalogSortOption[];
};

export type CategoryProductsArgs = {
  categoryId: string;
  page?: number;
  sort?: ProductSort | string;
  priceMin?: number;
  priceMax?: number;
  /** Backend-driven filter query params (keys from availableFilters). */
  filters?: Record<string, string>;
};

export type SearchProductsArgs = {
  q: string;
  page?: number;
  sort?: ProductSort | string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  filters?: Record<string, string>;
};

export type CatalogSelectionState = {
  sort: ProductSort | string;
  priceMin?: number;
  priceMax?: number;
  subcategory?: string;
  filters: Record<string, string>;
};

export const DEFAULT_PRODUCT_SORT: ProductSort = 'popular';

export const DEFAULT_SORT_OPTIONS: CatalogSortOption[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'newest', label: 'Newest' },
];
