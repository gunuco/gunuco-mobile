import { baseApi } from './baseApi';
import type { CheckoutPayload, CheckoutResult } from '@/src/types/checkout';
import { buildCheckoutBody, normalizeCheckoutResult } from '@/src/utils/checkout';

/**
 * Checkout — logical path from docs/api-requirements.md: POST checkout
 * Creates payment intent / order draft. Payment screen consumes this result; it does not call POST /checkout again.
 *
 * Idempotency: UUID in `Idempotency-Key` header and body `idempotencyKey`.
 * Exact request/response field names remain [CONFIRM].
 */
export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createCheckout: build.mutation<CheckoutResult, CheckoutPayload>({
      query: (payload) => ({
        url: '/checkout',
        method: 'POST',
        headers: { 'Idempotency-Key': payload.idempotencyKey },
        body: buildCheckoutBody(payload),
      }),
      transformResponse: (response: unknown) => normalizeCheckoutResult(response),
    }),
  }),
  overrideExisting: true,
});

export const { useCreateCheckoutMutation } = checkoutApi;
