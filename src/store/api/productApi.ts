import { baseApi } from './baseApi';
import type { ProductListResponse, SearchProductsArgs } from '@/src/types/catalog';
import { buildCatalogQueryParams, catalogListCacheKey } from '@/src/utils/catalogQuery';

/**
 * Product search — logical path from docs/api-requirements.md:
 * GET products/search
 *
 * Product detail endpoints are reserved for a later phase.
 */
export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchProducts: build.query<ProductListResponse, SearchProductsArgs>({
      query: ({ q, ...rest }) => ({
        url: '/products/search',
        params: {
          q,
          ...buildCatalogQueryParams(rest),
        },
      }),
      providesTags: ['Product'],
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

export const { useSearchProductsQuery, useLazySearchProductsQuery } = productApi;
