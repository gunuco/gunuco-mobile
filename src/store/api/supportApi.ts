import { baseApi } from './baseApi';
import type {
  CreateSupportTicketPayload,
  CreateSupportTicketResult,
  SendSupportMessagePayload,
  SupportTicketDetail,
  SupportTicketListArgs,
  SupportTicketListResponse,
} from '@/src/types/support';
import {
  mergeTicketListPages,
  normalizeTicketCreateResult,
  normalizeTicketDetail,
  normalizeTicketList,
  ticketsListCacheKey,
} from '@/src/utils/support';

const supportListTag = { type: 'Support' as const, id: 'LIST' };

/**
 * Support tickets — GET/POST list/create, GET detail, POST messages.
 * Attachments: POST support/tickets/{id}/attachments (Phase 10 complaint + create ticket).
 */
export const supportApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSupportTickets: build.query<SupportTicketListResponse, SupportTicketListArgs | void>({
      query: (args) => ({
        url: '/support/tickets',
        params: typeof args?.page === 'number' && args.page > 0 ? { page: args.page } : {},
      }),
      transformResponse: (response: unknown, _meta, arg) =>
        normalizeTicketList(response, arg?.page),
      providesTags: (result) => [
        supportListTag,
        ...(result?.items.map((item) => ({ type: 'Support' as const, id: item.id })) ?? []),
      ],
      serializeQueryArgs: ({ queryArgs }) => ticketsListCacheKey(queryArgs ?? {}),
      merge: (currentCache, newItems) => mergeTicketListPages(currentCache, newItems),
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
    getSupportTicket: build.query<SupportTicketDetail | null, string>({
      query: (ticketId) => `/support/tickets/${ticketId}`,
      transformResponse: (response: unknown) => normalizeTicketDetail(response),
      providesTags: (_result, _error, ticketId) => [{ type: 'Support', id: ticketId }],
    }),
    createSupportTicket: build.mutation<CreateSupportTicketResult, CreateSupportTicketPayload>({
      async queryFn(payload, _api, _extra, baseQuery) {
        const created = await baseQuery({
          url: '/support/tickets',
          method: 'POST',
          headers: { 'Idempotency-Key': payload.idempotencyKey },
          body: {
            message: payload.message,
            idempotencyKey: payload.idempotencyKey,
            ...(payload.orderId ? { orderId: payload.orderId } : {}),
            ...(payload.reasonCode ? { reasonCode: payload.reasonCode } : {}),
          },
        });
        if (created.error) {
          return { error: created.error };
        }
        const ticket = normalizeTicketCreateResult(created.data);
        if (!ticket.ticketId || payload.photos.length === 0) {
          return { data: ticket };
        }
        for (const photo of payload.photos.slice(0, 3)) {
          const form = new FormData();
          form.append('file', {
            uri: photo.uri,
            name: photo.name,
            type: photo.mimeType,
          } as unknown as Blob);
          const attached = await baseQuery({
            url: `/support/tickets/${ticket.ticketId}/attachments`,
            method: 'POST',
            body: form,
          });
          if (attached.error) {
            return { error: attached.error };
          }
        }
        return { data: ticket };
      },
      invalidatesTags: (result) => [
        supportListTag,
        ...(result?.ticketId ? [{ type: 'Support' as const, id: result.ticketId }] : []),
      ],
    }),
    sendSupportMessage: build.mutation<{ ok: boolean }, SendSupportMessagePayload>({
      query: ({ ticketId, message }) => ({
        url: `/support/tickets/${ticketId}/messages`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: (_result, _error, { ticketId }) => [
        { type: 'Support', id: ticketId },
        supportListTag,
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetSupportTicketsQuery,
  useGetSupportTicketQuery,
  useCreateSupportTicketMutation,
  useSendSupportMessageMutation,
} = supportApi;

/** Phase 10 complaint create uses the same ticket mutation. */
export const useCreateComplaintMutation = useCreateSupportTicketMutation;
