import { baseApi } from './baseApi';
import { cartApi } from './cartApi';
import type {
  ConfirmRazorpayPayload,
  InitiateRazorpayPayload,
  PaymentConfirmation,
  RazorpayCheckoutData,
} from '@/src/types/payment';
import {
  buildConfirmBody,
  buildInitiateBody,
  normalizePaymentConfirmation,
  normalizeRazorpayInitiation,
} from '@/src/utils/payment';

const cartListTag = { type: 'Cart' as const, id: 'LIST' };

/**
 * Razorpay payment — logical paths from docs/api-requirements.md:
 * POST payments/razorpay/initiate
 * POST payments/razorpay/confirm
 *
 * Checkout creation remains checkoutApi. Exact field names [CONFIRM].
 * No payment-status GET is documented, so none is called.
 */
export const paymentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    initiateRazorpayPayment: build.mutation<RazorpayCheckoutData, InitiateRazorpayPayload>({
      query: ({ checkoutId, idempotencyKey }) => ({
        url: '/payments/razorpay/initiate',
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: buildInitiateBody(checkoutId, idempotencyKey),
      }),
      transformResponse: (response: unknown) => normalizeRazorpayInitiation(response),
    }),
    confirmRazorpayPayment: build.mutation<PaymentConfirmation, ConfirmRazorpayPayload>({
      query: (payload) => ({
        url: '/payments/razorpay/confirm',
        method: 'POST',
        headers: { 'Idempotency-Key': payload.idempotencyKey },
        body: buildConfirmBody(payload),
      }),
      transformResponse: (response: unknown) => normalizePaymentConfirmation(response),
      invalidatesTags: (result) =>
        result?.verified ? [cartListTag, { type: 'StoreCredit' as const }] : [],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.verified) {
            void dispatch(cartApi.endpoints.getCart.initiate(undefined, { forceRefetch: true }));
          }
        } catch {
          // Verification failed or network dropped — do not clear Cart.
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const { useInitiateRazorpayPaymentMutation, useConfirmRazorpayPaymentMutation } = paymentApi;
