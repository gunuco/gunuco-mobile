import type { FulfilmentType } from '@/src/types/fulfilment';
import type { MoneyPaise } from '@/src/types/commerce';

/**
 * In-memory Payment handoff from Checkout. Not persisted. No secrets or signatures.
 */
export type PaymentSession = {
  checkoutId: string;
  amountPaise?: MoneyPaise;
  fulfilment?: FulfilmentType;
  locationLabel?: string;
  scheduleLabel?: string;
  razorpayOrderId?: string;
  keyId?: string;
  currency?: string;
};

let session: PaymentSession | null = null;

export function setPaymentSession(next: PaymentSession): void {
  session = { ...next };
}

export function peekPaymentSession(): PaymentSession | null {
  return session;
}

export function consumePaymentSession(): PaymentSession | null {
  const current = session;
  session = null;
  return current;
}

export function clearPaymentSession(): void {
  session = null;
}
