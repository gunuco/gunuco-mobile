import { baseApi } from './baseApi';
import type {
  RiderChatArgs,
  RiderChatMessage,
  RiderChatThread,
  SendRiderChatPayload,
} from '@/src/types/riderChat';
import {
  mergeRiderChatPages,
  normalizeRiderChatMessage,
  normalizeRiderChatThread,
  riderChatCacheKey,
} from '@/src/utils/riderChat';

/**
 * Delivery-scoped rider chat — logical paths from docs/api-requirements.md:
 * GET orders/{id}/rider-chat/messages
 * POST orders/{id}/rider-chat/messages
 *
 * Not a generic chat system. Pagination page vs cursor remains [CONFIRM].
 */
export const chatApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRiderChatMessages: build.query<RiderChatThread, RiderChatArgs>({
      query: ({ orderId, page }) => ({
        url: `/orders/${orderId}/rider-chat/messages`,
        params: typeof page === 'number' && page > 1 ? { page } : undefined,
      }),
      transformResponse: (response: unknown, _meta, arg) =>
        normalizeRiderChatThread(response, arg.page),
      providesTags: (_result, _error, arg) => [{ type: 'RiderChat', id: arg.orderId }],
      serializeQueryArgs: ({ queryArgs }) => riderChatCacheKey(queryArgs),
      merge: (currentCache, newItems) => mergeRiderChatPages(currentCache, newItems),
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
    sendRiderChatMessage: build.mutation<RiderChatMessage | null, SendRiderChatPayload>({
      query: ({ orderId, text }) => ({
        url: `/orders/${orderId}/rider-chat/messages`,
        method: 'POST',
        body: { text },
      }),
      transformResponse: (response: unknown) => normalizeRiderChatMessage(response),
      invalidatesTags: (_result, _error, arg) => [{ type: 'RiderChat', id: arg.orderId }],
    }),
  }),
  overrideExisting: true,
});

export const { useGetRiderChatMessagesQuery, useSendRiderChatMessageMutation } = chatApi;
