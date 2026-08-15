import { baseApi } from './baseApi';
import type { CreateComplaintPayload, CreateComplaintResult } from '@/src/types/complaint';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function normalizeTicket(response: unknown): CreateComplaintResult {
  const root = asRecord(response) ?? {};
  const data = asRecord(root.data) ?? asRecord(root.ticket) ?? root;
  const ticketId = asString(data.id) ?? asString(data.ticketId);
  return {
    success: asBoolean(data.success) ?? Boolean(ticketId),
    ticketId,
    message: asString(data.message) ?? null,
  };
}

/**
 * Minimal complaint/return create — POST /support/tickets.
 * Does not implement Support Hub, ticket list, or ticket thread.
 * Eligibility API remains [CONFIRM]. Attachments: POST /support/tickets/{id}/attachments.
 */
export const supportApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createComplaint: build.mutation<CreateComplaintResult, CreateComplaintPayload>({
      async queryFn(payload, _api, _extra, baseQuery) {
        const created = await baseQuery({
          url: '/support/tickets',
          method: 'POST',
          headers: { 'Idempotency-Key': payload.idempotencyKey },
          body: {
            orderId: payload.orderId,
            message: payload.message,
            idempotencyKey: payload.idempotencyKey,
            ...(payload.reasonCode ? { reasonCode: payload.reasonCode } : {}),
          },
        });
        if (created.error) {
          return { error: created.error };
        }
        const ticket = normalizeTicket(created.data);
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
      invalidatesTags: [{ type: 'Support', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
});

export const { useCreateComplaintMutation } = supportApi;
