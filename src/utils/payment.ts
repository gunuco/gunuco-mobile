import type {
  ConfirmRazorpayPayload,
  PaymentConfirmation,
  RazorpayCheckoutData,
} from '@/src/types/payment';
import { normalizeFulfilmentType } from '@/src/utils/fulfilment';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function unwrap(response: unknown): Record<string, unknown> {
  const root = asRecord(response) ?? {};
  return (
    asRecord(root.data) ??
    asRecord(root.payment) ??
    asRecord(root.checkout) ??
    asRecord(root.order) ??
    root
  );
}

export function normalizeRazorpayInitiation(response: unknown): RazorpayCheckoutData {
  const data = unwrap(response);
  return {
    checkoutId: asString(data.checkoutId),
    razorpayOrderId: asString(data.razorpayOrderId) ?? asString(data.razorpay_order_id),
    keyId: asString(data.keyId) ?? asString(data.key) ?? asString(data.razorpayKeyId),
    // Prefer amountPaise. `amount` is treated as paise if present [CONFIRM].
    amountPaise: asNumber(data.amountPaise) ?? asNumber(data.payablePaise) ?? asNumber(data.amount),
    currency: asString(data.currency),
    message: asString(data.message) ?? null,
  };
}

export function buildInitiateBody(
  checkoutId: string,
  idempotencyKey: string,
): Record<string, unknown> {
  return { checkoutId, idempotencyKey };
}

export function buildConfirmBody(payload: ConfirmRazorpayPayload): Record<string, unknown> {
  const body: Record<string, unknown> = {
    checkoutId: payload.checkoutId,
    idempotencyKey: payload.idempotencyKey,
    razorpay_payment_id: payload.razorpay_payment_id,
  };
  if (payload.razorpay_order_id) {
    body.razorpay_order_id = payload.razorpay_order_id;
  }
  if (payload.razorpay_signature) {
    body.razorpay_signature = payload.razorpay_signature;
  }
  return body;
}

export function normalizePaymentConfirmation(response: unknown): PaymentConfirmation {
  const data = unwrap(response);
  const status = asString(data.status) ?? asString(data.paymentStatus);
  const verifiedFlag =
    asBoolean(data.verified) ?? asBoolean(data.success) ?? asBoolean(data.confirmed);
  const verifiedFromStatus =
    status === 'success' || status === 'paid' || status === 'captured' || status === 'confirmed';
  const alreadyProcessed = asBoolean(data.alreadyProcessed) ?? asBoolean(data.already_processed);
  const verified = Boolean(verifiedFlag ?? verifiedFromStatus) || Boolean(alreadyProcessed);
  const order = asRecord(data.order) ?? data;
  return {
    verified,
    alreadyProcessed,
    orderNumber:
      asString(order.orderNumber) ?? asString(order.number) ?? asString(data.orderNumber),
    orderId: asString(order.orderId) ?? asString(order.id) ?? asString(data.orderId),
    totalPaise:
      asNumber(order.totalPaise) ??
      asNumber(order.amountPaise) ??
      asNumber(data.totalPaise) ??
      asNumber(data.amountPaise),
    fulfilment: data.fulfilment
      ? normalizeFulfilmentType(data.fulfilment)
      : order.fulfilment
        ? normalizeFulfilmentType(order.fulfilment)
        : undefined,
    locationLabel:
      asString(data.locationLabel) ??
      asString(data.addressSummary) ??
      asString(data.pickupSummary) ??
      asString(order.locationLabel),
    scheduleLabel:
      asString(data.scheduleLabel) ?? asString(data.slotLabel) ?? asString(order.scheduleLabel),
    paymentStatus: status,
    message: asString(data.message) ?? null,
  };
}

export function hasCompleteRazorpayPrep(data: RazorpayCheckoutData | null | undefined): boolean {
  return Boolean(data?.razorpayOrderId && typeof data.amountPaise === 'number' && data.keyId);
}
