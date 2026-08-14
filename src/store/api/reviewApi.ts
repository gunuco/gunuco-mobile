import { baseApi } from './baseApi';
import type {
  CreateReviewPayload,
  CreateReviewResponse,
  ProductReviewsArgs,
  ProductReviewsResponse,
  ReviewableItemsResponse,
} from '@/src/types/review';
import {
  mergeReviewListPages,
  normalizeCreateReviewResponse,
  normalizeProductReviewsResponse,
  normalizeReviewableItems,
  reviewsListCacheKey,
} from '@/src/utils/reviews';

/**
 * Reviews — logical paths from docs/api-requirements.md:
 * GET products/{id}/reviews
 * GET orders/{id}/reviewable-items
 * POST reviews { orderItemId, rating, text }
 *
 * Eligibility and moderation are backend-owned.
 */
export const reviewApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProductReviews: build.query<ProductReviewsResponse, ProductReviewsArgs>({
      query: ({ productId, page }) => ({
        url: `/products/${productId}/reviews`,
        params: typeof page === 'number' && page > 0 ? { page } : undefined,
      }),
      transformResponse: (response: unknown, _meta, arg) =>
        normalizeProductReviewsResponse(response, arg.page),
      providesTags: (_result, _error, arg) => [{ type: 'Review', id: arg.productId }],
      serializeQueryArgs: ({ queryArgs }) => reviewsListCacheKey(queryArgs),
      merge: (currentCache, newItems) => mergeReviewListPages(currentCache, newItems),
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
    getReviewableItems: build.query<ReviewableItemsResponse, string>({
      query: (orderId) => `/orders/${orderId}/reviewable-items`,
      transformResponse: (response: unknown) => normalizeReviewableItems(response),
      providesTags: (_result, _error, orderId) => [{ type: 'Review', id: `reviewable-${orderId}` }],
    }),
    createReview: build.mutation<CreateReviewResponse, CreateReviewPayload>({
      query: ({ orderItemId, rating, text }) => ({
        url: '/reviews',
        method: 'POST',
        body: { orderItemId, rating, text },
      }),
      transformResponse: (response: unknown) => normalizeCreateReviewResponse(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Review', id: 'LIST' },
        ...(arg.productId
          ? [
              { type: 'Review' as const, id: arg.productId },
              { type: 'Product' as const, id: arg.productId },
            ]
          : []),
      ],
    }),
  }),
  overrideExisting: true,
});

export const { useGetProductReviewsQuery, useGetReviewableItemsQuery, useCreateReviewMutation } =
  reviewApi;
