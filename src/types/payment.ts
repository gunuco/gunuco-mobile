import type { MoneyPaise } from './commerce';
import type { FulfilmentType } from './fulfilment';

export type PaymentUiState =
  | 'IDLE'
  | 'PREPARING'
  | 'RAZORPAY_OPEN'
  | 'VERIFYING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED'
  | 'UNKNOWN';

/**
 * POST /payments/razorpay/initiate
 * Request/response field names remain [CONFIRM] against backend OpenAPI.
 */
export type InitiateRazorpayPayload = {
  checkoutId: string;
  idempotencyKey: string;
};

export type RazorpayCheckoutData = {
  checkoutId?: string;
  razorpayOrderId?: string;
  keyId?: string;
  amountPaise?: MoneyPaise;
  currency?: string;
  message?: string | null;
};

/**
 * POST /payments/razorpay/confirm
 * Razorpay callback fields are sent as returned by the SDK. Exact backend names [CONFIRM].
 */
export type ConfirmRazorpayPayload = {
  checkoutId: string;
  idempotencyKey: string;
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

export type PaymentConfirmation = {
  verified: boolean;
  alreadyProcessed?: boolean;
  orderNumber?: string;
  orderId?: string;
  totalPaise?: MoneyPaise;
  fulfilment?: FulfilmentType;
  locationLabel?: string;
  scheduleLabel?: string;
  paymentStatus?: string;
  message?: string | null;
};
