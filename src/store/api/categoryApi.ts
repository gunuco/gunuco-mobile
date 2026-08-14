import { baseApi } from './baseApi';
import type {
  CategoriesResponse,
  CategoryNode,
  CategoryProductsArgs,
  ProductListResponse,
} from '@/src/types/catalog';
import {
  buildCatalogQueryParams,
  catalogListCacheKey,
  mergeProductListPages,
  normalizeProductListResponse,
} from '@/src/utils/catalogQuery';

function normalizeCategoriesResponse(
  response: CategoriesResponse | CategoryNode[] | { data: CategoryNode[] },
): CategoriesResponse {
  if (Array.isArray(response)) {
    return { categories: response };
  }
  if ('categories' in response && Array.isArray(response.categories)) {
    return response;
  }
  if ('data' in response && Array.isArray(response.data)) {
    return { categories: response.data };
  }
  return { categories: [] };
}

/**
 * Category catalogue — logical paths from docs/api-requirements.md:
 * GET categories
 * GET categories/{id}/products
 */
export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<CategoriesResponse, void>({
      query: () => '/categories',
      providesTags: ['Category'],
      transformResponse: normalizeCategoriesResponse,
    }),
    getCategoryProducts: build.query<ProductListResponse, CategoryProductsArgs>({
      query: ({ categoryId, ...rest }) => ({
        url: `/categories/${categoryId}/products`,
        params: buildCatalogQueryParams(rest),
      }),
      transformResponse: (response: ProductListResponse, _meta, arg) =>
        normalizeProductListResponse(response, arg.page),
      providesTags: (_result, _error, arg) => [
        { type: 'Product', id: `category-${arg.categoryId}` },
      ],
      serializeQueryArgs: ({ queryArgs }) => catalogListCacheKey(queryArgs),
      merge: (currentCache, newItems) => mergeProductListPages(currentCache, newItems),
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCategoriesQuery,
  useLazyGetCategoriesQuery,
  useGetCategoryProductsQuery,
  useLazyGetCategoryProductsQuery,
} = categoryApi;
