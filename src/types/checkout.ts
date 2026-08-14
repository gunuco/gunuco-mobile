import type { MoneyPaise } from './commerce';
import type { FulfilmentType } from './fulfilment';

/**
 * POST /checkout body.
 * Exact field names remain [CONFIRM] against backend OpenAPI.
 */
export type CheckoutPayload = {
  idempotencyKey: string;
  fulfilment: FulfilmentType;
  asap: boolean;
  addressId?: string;
  slotId?: string;
  coupon?: string;
  /** [CONFIRM] store-credit application shape. Currently `{ max: true }` when applied. */
  storeCredit?: { max: true };
};

export type CheckoutResult = {
  checkoutId?: string;
  orderDraftId?: string;
  paymentIntentId?: string;
  amountPaise?: MoneyPaise;
  razorpayOrderId?: string;
  keyId?: string;
  currency?: string;
  message?: string | null;
};
