/**
 * In-memory post-auth intent. Not persisted, not placed in route params.
 * Used so a guest wishlist tap can resume after phone OTP.
 */

export type AuthIntent = {
  returnTo?: string;
  pendingWishlistProductId?: string;
  pendingWriteReview?: {
    orderItemId: string;
    productId?: string;
  };
};

let currentIntent: AuthIntent | null = null;

export function setAuthIntent(intent: AuthIntent): void {
  currentIntent = { ...intent };
}

export function consumeAuthIntent(): AuthIntent | null {
  const intent = currentIntent;
  currentIntent = null;
  return intent;
}

export function clearAuthIntent(): void {
  currentIntent = null;
}
