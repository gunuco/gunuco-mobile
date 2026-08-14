import { baseApi } from './baseApi';
import type { WishlistResponse } from '@/src/types/wishlist';
import { normalizeWishlistResponse } from '@/src/utils/wishlist';

/**
 * Wishlist — logical paths from docs/api-requirements.md:
 * GET wishlist
 * POST wishlist/{productId}
 * DELETE wishlist/{productId}
 *
 * Auth required. No local guest wishlist.
 */
export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWishlist: build.query<WishlistResponse, void>({
      query: () => '/wishlist',
      transformResponse: (response: unknown) => normalizeWishlistResponse(response),
      providesTags: (result) =>
        result
          ? [
              { type: 'Wishlist', id: 'LIST' },
              ...result.items.map((item) => ({ type: 'Wishlist' as const, id: item.id })),
            ]
          : [{ type: 'Wishlist', id: 'LIST' }],
    }),
    addWishlistItem: build.mutation<void, string>({
      query: (productId) => ({
        url: `/wishlist/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, productId) => [
        { type: 'Wishlist', id: 'LIST' },
        { type: 'Wishlist', id: productId },
        { type: 'Product', id: productId },
      ],
    }),
    removeWishlistItem: build.mutation<void, string>({
      query: (productId) => ({
        url: `/wishlist/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, productId) => [
        { type: 'Wishlist', id: 'LIST' },
        { type: 'Wishlist', id: productId },
        { type: 'Product', id: productId },
      ],
    }),
  }),
  overrideExisting: true,
});

export const { useGetWishlistQuery, useAddWishlistItemMutation, useRemoveWishlistItemMutation } =
  wishlistApi;
