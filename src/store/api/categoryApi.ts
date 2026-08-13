import { baseApi } from './baseApi';
import type {
  CategoriesResponse,
  CategoryNode,
  CategoryProductsArgs,
  ProductListResponse,
} from '@/src/types/catalog';
import { buildCatalogQueryParams, catalogListCacheKey } from '@/src/utils/catalogQuery';

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
      providesTags: (_result, _error, arg) => [
        { type: 'Product', id: `category-${arg.categoryId}` },
      ],
      serializeQueryArgs: ({ queryArgs }) => catalogListCacheKey(queryArgs),
      merge: (currentCache, newItems) => {
        if (newItems.page <= 1) {
          return newItems;
        }
        return {
          ...newItems,
          items: [...(currentCache?.items ?? []), ...newItems.items],
        };
      },
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
