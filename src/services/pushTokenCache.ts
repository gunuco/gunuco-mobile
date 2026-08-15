/**
 * Last successfully registered native push token.
 * Isolated so session teardown can clear it without importing the store.
 */
let lastRegisteredToken: string | null = null;

export function getLastRegisteredPushToken(): string | null {
  return lastRegisteredToken;
}

export function setLastRegisteredPushToken(token: string): void {
  lastRegisteredToken = token;
}

export function clearRegisteredPushToken(): void {
  lastRegisteredToken = null;
}
