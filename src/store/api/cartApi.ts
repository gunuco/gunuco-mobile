import { baseApi } from './baseApi';
import type { AddCartItemPayload, AddCartItemResponse } from '@/src/types/product';

function normalizeAddCartItemResponse(response: unknown): AddCartItemResponse {
  if (!response || typeof response !== 'object') {
    return {};
  }
  const rec = response as Record<string, unknown>;
  const nested =
    rec.item && typeof rec.item === 'object' ? (rec.item as Record<string, unknown>) : rec;
  const itemId =
    typeof nested.itemId === 'string'
      ? nested.itemId
      : typeof nested.id === 'string'
        ? nested.id
        : undefined;
  const cartId = typeof rec.cartId === 'string' ? rec.cartId : undefined;
  return { itemId, cartId };
}

/**
 * Cart mutation used by Product Details Add to Cart.
 * Logical path from docs/api-requirements.md: POST cart/items
 *
 * GET cart and the rest of the Cart feature belong to a later phase.
 */
export const cartApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    addCartItem: build.mutation<AddCartItemResponse, AddCartItemPayload>({
      query: ({ productId, quantity, options }) => ({
        url: '/cart/items',
        method: 'POST',
        body: { productId, quantity, options },
      }),
      transformResponse: (response: unknown) => normalizeAddCartItemResponse(response),
      invalidatesTags: ['Cart'],
    }),
  }),
  overrideExisting: true,
});

export const { useAddCartItemMutation } = cartApi;
