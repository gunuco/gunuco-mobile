/**
 * In-memory Checkout UI handoff (address book → checkout).
 * Not persisted. Not a second cart source of truth.
 */

let selectedAddressId: string | null = null;

export function setCheckoutSelectedAddressId(addressId: string): void {
  selectedAddressId = addressId;
}

export function peekCheckoutSelectedAddressId(): string | null {
  return selectedAddressId;
}

export function consumeCheckoutSelectedAddressId(): string | null {
  const current = selectedAddressId;
  selectedAddressId = null;
  return current;
}

export function clearCheckoutSelectedAddressId(): void {
  selectedAddressId = null;
}
