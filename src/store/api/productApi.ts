import { baseApi } from './baseApi';
import type { ProductListResponse, SearchProductsArgs } from '@/src/types/catalog';
import type { ProductDetail, ProductOptionsResponse } from '@/src/types/product';
import {
  buildCatalogQueryParams,
  catalogListCacheKey,
  mergeProductListPages,
  normalizeProductListResponse,
} from '@/src/utils/catalogQuery';
import { normalizeProductDetail, normalizeProductOptions } from '@/src/utils/productDetail';

/**
 * Product search + detail — logical paths from docs/api-requirements.md:
 * GET products/search
 * GET products/{id}
 * GET products/{id}/options
 *
 * POST products/quote remains [CONFIRM] and is not called.
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
      transformResponse: (response: ProductListResponse, _meta, arg) =>
        normalizeProductListResponse(response, arg.page),
      providesTags: ['Product'],
      serializeQueryArgs: ({ queryArgs }) => catalogListCacheKey(queryArgs),
      merge: (currentCache, newItems) => mergeProductListPages(currentCache, newItems),
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
    getProduct: build.query<ProductDetail, string>({
      query: (productId) => `/products/${productId}`,
      transformResponse: (response: unknown) => normalizeProductDetail(response),
      providesTags: (_result, _error, productId) => [{ type: 'Product', id: productId }],
    }),
    getProductOptions: build.query<ProductOptionsResponse, string>({
      query: (productId) => `/products/${productId}/options`,
      transformResponse: (response: unknown) => normalizeProductOptions(response),
      providesTags: (_result, _error, productId) => [
        { type: 'Product', id: `${productId}-options` },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useSearchProductsQuery,
  useLazySearchProductsQuery,
  useGetProductQuery,
  useGetProductOptionsQuery,
} = productApi;
