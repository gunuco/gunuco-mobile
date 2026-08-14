import type { OrderConfirmation } from '@/src/types/order';

/**
 * In-memory confirmed order for the confirmation screen.
 * Not persisted. No payment secrets. App kill clears this — do not assume success on relaunch.
 */
let confirmation: OrderConfirmation | null = null;

export function setOrderConfirmation(next: OrderConfirmation): void {
  confirmation = { ...next };
}

export function peekOrderConfirmation(): OrderConfirmation | null {
  return confirmation;
}

export function clearOrderConfirmation(): void {
  confirmation = null;
}
