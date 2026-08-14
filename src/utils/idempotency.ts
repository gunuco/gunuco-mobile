import { randomUUID } from 'expo-crypto';

/** UUID for checkout idempotency. Reuse for retries of the same attempt. */
export function createIdempotencyKey(): string {
  return randomUUID();
}
