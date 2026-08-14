import { baseApi } from './baseApi';
import type { AddCartItemPayload, AddCartItemResponse } from '@/src/types/product';
import type { ApplyCouponPayload, Cart, UpdateCartItemPayload } from '@/src/types/cart';
import type { ApplyStoreCreditPayload } from '@/src/types/storeCredit';
import { mutationReturnedCart, normalizeCart } from '@/src/utils/cart';

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

const cartListTag = { type: 'Cart' as const, id: 'LIST' };

function cartTags(cart: Cart | undefined) {
  if (!cart) {
    return [cartListTag];
  }
  return [cartListTag, ...cart.items.map((item) => ({ type: 'Cart' as const, id: item.id }))];
}

/**
 * Common server cart — logical paths from docs/api-requirements.md:
 * GET cart
 * POST cart/items
 * PATCH cart/items/{id}
 * DELETE cart/items/{id}
 * POST cart/revalidate
 * POST cart/apply-coupon
 * DELETE cart/coupon
 * POST cart/apply-store-credit
 * DELETE cart/store-credit
 *
 * POST cart/merge remains [CONFIRM] and is not called.
 */
export const cartApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query<Cart, void>({
      query: () => '/cart',
      transformResponse: (response: unknown) => normalizeCart(response),
      providesTags: (result) => cartTags(result),
    }),
    addCartItem: build.mutation<AddCartItemResponse, AddCartItemPayload>({
      query: ({ productId, quantity, options }) => ({
        url: '/cart/items',
        method: 'POST',
        body: { productId, quantity, options },
      }),
      transformResponse: (response: unknown) => normalizeAddCartItemResponse(response),
      invalidatesTags: [cartListTag],
    }),
    updateCartItem: build.mutation<Cart | undefined, UpdateCartItemPayload>({
      query: ({ itemId, quantity }) => ({
        url: `/cart/items/${itemId}`,
        method: 'PATCH',
        body: { quantity },
      }),
      transformResponse: (response: unknown) => mutationReturnedCart(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(cartApi.util.updateQueryData('getCart', undefined, () => data));
          }
        } catch {
          // UI keeps previous cart; error is surfaced by the caller.
        }
      },
      invalidatesTags: (result) => (result ? [] : [cartListTag]),
    }),
    removeCartItem: build.mutation<Cart | undefined, string>({
      query: (itemId) => ({
        url: `/cart/items/${itemId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: unknown) => mutationReturnedCart(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(cartApi.util.updateQueryData('getCart', undefined, () => data));
          }
        } catch {
          // Keep the item until a successful server response.
        }
      },
      invalidatesTags: (result) => (result ? [] : [cartListTag]),
    }),
    revalidateCart: build.mutation<Cart | undefined, void>({
      query: () => ({
        url: '/cart/revalidate',
        method: 'POST',
      }),
      transformResponse: (response: unknown) => mutationReturnedCart(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(cartApi.util.updateQueryData('getCart', undefined, () => data));
          }
        } catch {
          // Caller shows a safe error and stays on Checkout.
        }
      },
      invalidatesTags: (result) => (result ? [] : [cartListTag]),
    }),
    applyCoupon: build.mutation<Cart | undefined, ApplyCouponPayload>({
      query: ({ code }) => ({
        url: '/cart/apply-coupon',
        method: 'POST',
        body: { code },
      }),
      transformResponse: (response: unknown) => mutationReturnedCart(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(cartApi.util.updateQueryData('getCart', undefined, () => data));
          }
        } catch {
          // Totals stay server-authoritative; UI shows mapped coupon errors.
        }
      },
      invalidatesTags: (result) => (result ? [] : [cartListTag]),
    }),
    removeCoupon: build.mutation<Cart | undefined, void>({
      query: () => ({
        url: '/cart/coupon',
        method: 'DELETE',
      }),
      transformResponse: (response: unknown) => mutationReturnedCart(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(cartApi.util.updateQueryData('getCart', undefined, () => data));
          }
        } catch {
          // Keep the applied coupon until DELETE succeeds.
        }
      },
      invalidatesTags: (result) => (result ? [] : [cartListTag]),
    }),
    applyStoreCredit: build.mutation<Cart | undefined, ApplyStoreCreditPayload>({
      query: (body) => ({
        url: '/cart/apply-store-credit',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => mutationReturnedCart(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(cartApi.util.updateQueryData('getCart', undefined, () => data));
          }
        } catch {
          // Totals stay server-authoritative.
        }
      },
      invalidatesTags: (result) =>
        result
          ? [{ type: 'StoreCredit' as const }]
          : [cartListTag, { type: 'StoreCredit' as const }],
    }),
    removeStoreCredit: build.mutation<Cart | undefined, void>({
      query: () => ({
        url: '/cart/store-credit',
        method: 'DELETE',
      }),
      transformResponse: (response: unknown) => mutationReturnedCart(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(cartApi.util.updateQueryData('getCart', undefined, () => data));
          }
        } catch {
          // Keep applied store credit until DELETE succeeds.
        }
      },
      invalidatesTags: (result) =>
        result
          ? [{ type: 'StoreCredit' as const }]
          : [cartListTag, { type: 'StoreCredit' as const }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useRevalidateCartMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
  useApplyStoreCreditMutation,
  useRemoveStoreCreditMutation,
} = cartApi;
