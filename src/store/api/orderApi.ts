import { baseApi } from './baseApi';
import { cartApi } from './cartApi';
import type {
  CancelOrderPayload,
  CancelOrderResult,
  CancellationEligibility,
  InvoiceResult,
  OrderDetail,
  OrderListArgs,
  OrderListResponse,
  ReorderPayload,
  ReorderResult,
} from '@/src/types/order';
import {
  mergeOrderListPages,
  normalizeCancelOrderResult,
  normalizeCancellationEligibility,
  normalizeInvoiceResult,
  normalizeOrderDetail,
  normalizeOrderListResponse,
  normalizeReorderResult,
  ordersListCacheKey,
} from '@/src/utils/orders';

const orderListTag = { type: 'Order' as const, id: 'LIST' };
const cartListTag = { type: 'Cart' as const, id: 'LIST' };

/**
 * Orders — logical paths from docs/api-requirements.md:
 * GET orders?statusGroup=
 * GET orders/{id}
 * GET orders/{id}/cancellation-eligibility
 * POST orders/{id}/cancel
 * POST orders/{id}/reorder
 * GET orders/{id}/invoice
 *
 * Exact field names remain [CONFIRM]. Pagination is page-based like reviews.
 */
export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<OrderListResponse, OrderListArgs>({
      query: ({ statusGroup, page }) => ({
        url: '/orders',
        params: {
          statusGroup,
          ...(typeof page === 'number' && page > 0 ? { page } : {}),
        },
      }),
      transformResponse: (response: unknown, _meta, arg) =>
        normalizeOrderListResponse(response, arg.page),
      providesTags: (result, _error, arg) => [
        orderListTag,
        { type: 'Order', id: `LIST-${arg.statusGroup}` },
        ...(result?.items.map((item) => ({ type: 'Order' as const, id: item.id })) ?? []),
      ],
      serializeQueryArgs: ({ queryArgs }) => ordersListCacheKey(queryArgs),
      merge: (currentCache, newItems) => mergeOrderListPages(currentCache, newItems),
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
    getOrder: build.query<OrderDetail | null, string>({
      query: (orderId) => `/orders/${orderId}`,
      transformResponse: (response: unknown) => normalizeOrderDetail(response),
      providesTags: (_result, _error, orderId) => [{ type: 'Order', id: orderId }],
    }),
    getCancellationEligibility: build.query<CancellationEligibility, string>({
      query: (orderId) => `/orders/${orderId}/cancellation-eligibility`,
      transformResponse: (response: unknown) => normalizeCancellationEligibility(response),
      providesTags: (_result, _error, orderId) => [{ type: 'Order', id: `cancel-${orderId}` }],
    }),
    cancelOrder: build.mutation<CancelOrderResult, CancelOrderPayload>({
      query: ({ orderId, reasonCode, otherText, idempotencyKey }) => ({
        url: `/orders/${orderId}/cancel`,
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: {
          reasonCode,
          idempotencyKey,
          ...(reasonCode === 'OTHER' && otherText ? { otherText } : {}),
        },
      }),
      transformResponse: (response: unknown) => normalizeCancelOrderResult(response),
      invalidatesTags: (_result, _error, arg) => [
        orderListTag,
        { type: 'Order', id: arg.orderId },
        { type: 'Order', id: `cancel-${arg.orderId}` },
        { type: 'Order', id: 'LIST-active' },
        { type: 'Order', id: 'LIST-cancelled' },
      ],
    }),
    reorderOrder: build.mutation<ReorderResult, ReorderPayload>({
      query: ({ orderId, idempotencyKey }) => ({
        url: `/orders/${orderId}/reorder`,
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: { idempotencyKey },
      }),
      transformResponse: (response: unknown) => normalizeReorderResult(response),
      invalidatesTags: (result) => (result?.cartUpdated ? [cartListTag] : []),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.cartUpdated) {
            void dispatch(cartApi.endpoints.getCart.initiate(undefined, { forceRefetch: true }));
          }
        } catch {
          // Caller surfaces the error. Do not navigate on failure.
        }
      },
    }),
    getOrderInvoice: build.query<InvoiceResult, string>({
      query: (orderId) => `/orders/${orderId}/invoice`,
      transformResponse: (response: unknown) => normalizeInvoiceResult(response),
      providesTags: (_result, _error, orderId) => [{ type: 'Order', id: `invoice-${orderId}` }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetCancellationEligibilityQuery,
  useCancelOrderMutation,
  useReorderOrderMutation,
  useLazyGetOrderInvoiceQuery,
} = orderApi;
