import type { CheckoutPayload, CheckoutResult } from '@/src/types/checkout';
import type { FulfilmentType } from '@/src/types/fulfilment';

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

export function normalizeCheckoutResult(response: unknown): CheckoutResult {
  const root = asRecord(response) ?? {};
  const data = asRecord(root.data) ?? asRecord(root.checkout) ?? root;
  return {
    checkoutId: asString(data.checkoutId) ?? asString(data.id),
    orderDraftId: asString(data.orderDraftId) ?? asString(data.draftOrderId),
    paymentIntentId: asString(data.paymentIntentId) ?? asString(data.paymentId),
    amountPaise: asNumber(data.amountPaise) ?? asNumber(data.amount) ?? asNumber(data.payablePaise),
    razorpayOrderId: asString(data.razorpayOrderId) ?? asString(data.razorpay_order_id),
    message: asString(data.message) ?? null,
  };
}

export function buildCheckoutBody(payload: CheckoutPayload): Record<string, unknown> {
  const body: Record<string, unknown> = {
    idempotencyKey: payload.idempotencyKey,
    fulfilment: payload.fulfilment,
    asap: payload.asap,
  };
  if (payload.addressId) {
    body.addressId = payload.addressId;
  }
  if (payload.slotId) {
    body.slotId = payload.slotId;
  }
  if (payload.coupon) {
    body.coupon = payload.coupon;
  }
  if (payload.storeCredit) {
    body.storeCredit = payload.storeCredit;
  }
  return body;
}

export function isDelivery(type: FulfilmentType): boolean {
  return type === 'DELIVERY';
}
