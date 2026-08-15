import { baseApi } from './baseApi';
import type { OrderRider, OrderTracking } from '@/src/types/tracking';
import { normalizeOrderRider, normalizeOrderTracking } from '@/src/utils/tracking';

/**
 * Tracking + rider — logical paths from docs/api-requirements.md:
 * GET orders/{id}/tracking
 * GET orders/{id}/rider
 *
 * Isolated from Order Detail cache so GPS updates do not rewrite the order.
 * No WebSocket path is documented.
 */
export const trackingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrderTracking: build.query<OrderTracking, string>({
      query: (orderId) => `/orders/${orderId}/tracking`,
      transformResponse: (response: unknown) => normalizeOrderTracking(response),
      providesTags: (_result, _error, orderId) => [{ type: 'Tracking', id: orderId }],
    }),
    getOrderRider: build.query<OrderRider, string>({
      query: (orderId) => `/orders/${orderId}/rider`,
      transformResponse: (response: unknown) => normalizeOrderRider(response),
      providesTags: (_result, _error, orderId) => [{ type: 'Tracking', id: `rider-${orderId}` }],
    }),
  }),
  overrideExisting: true,
});

export const { useGetOrderTrackingQuery, useGetOrderRiderQuery } = trackingApi;
