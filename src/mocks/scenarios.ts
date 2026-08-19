export type UiTestNetwork = 'ONLINE' | 'SLOW' | 'OFFLINE';

export type UiTestScenario =
  | 'SUCCESS'
  | 'EMPTY'
  | 'LOADING'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'SERVICEABILITY_FAILED'
  | 'COUPON_FAILED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_CANCELLED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_UNKNOWN'
  | 'PAYMENT_VERIFICATION_FAILED'
  | 'MAINTENANCE'
  | 'FORCE_UPDATE';

export type UiTestCustomerId = 'ui-test-customer-a' | 'ui-test-customer-b';

type UiTestControls = {
  scenario: UiTestScenario;
  network: UiTestNetwork;
  latencyMs: number;
};

const DEFAULT_LATENCY_MS = 600;
const SLOW_LATENCY_MS = 2200;
const LOADING_LATENCY_MS = 1600;

const controls: UiTestControls = {
  scenario: 'SUCCESS',
  network: 'ONLINE',
  latencyMs: DEFAULT_LATENCY_MS,
};

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => {
    listener();
  });
}

export function getUiTestControls(): UiTestControls {
  return { ...controls };
}

export function getUiTestScenario(): UiTestScenario {
  return controls.scenario;
}

export function getUiTestNetwork(): UiTestNetwork {
  return controls.network;
}

export function getUiTestLatencyMs(): number {
  if (controls.network === 'OFFLINE') {
    return 0;
  }
  if (controls.network === 'SLOW') {
    return SLOW_LATENCY_MS;
  }
  if (controls.scenario === 'LOADING') {
    return LOADING_LATENCY_MS;
  }
  if (controls.scenario === 'TIMEOUT') {
    return 0;
  }
  return controls.latencyMs;
}

export function setUiTestScenario(scenario: UiTestScenario): void {
  controls.scenario = scenario;
  notify();
}

export function setUiTestNetwork(network: UiTestNetwork): void {
  controls.network = network;
  notify();
}

export function subscribeUiTestControls(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const UI_TEST_OTP = '123456';

export const UI_TEST_CUSTOMERS: Record<
  UiTestCustomerId,
  { customerId: UiTestCustomerId; name: string; phone: string; email: string }
> = {
  'ui-test-customer-a': {
    customerId: 'ui-test-customer-a',
    name: 'GUNUCO Test Customer A',
    phone: '9000000001',
    email: 'customer-a@ui-test.gunuco.invalid',
  },
  'ui-test-customer-b': {
    customerId: 'ui-test-customer-b',
    name: 'GUNUCO Test Customer B',
    phone: '9000000002',
    email: 'customer-b@ui-test.gunuco.invalid',
  },
};

export function accessTokenFor(customerId: UiTestCustomerId): string {
  return `ui-test-access-${customerId}`;
}

export function refreshTokenFor(customerId: UiTestCustomerId): string {
  return `ui-test-refresh-${customerId}`;
}

export function customerIdFromToken(token: string | undefined): UiTestCustomerId | null {
  if (!token) {
    return null;
  }
  if (token.includes('ui-test-customer-b')) {
    return 'ui-test-customer-b';
  }
  if (token.includes('ui-test-customer-a')) {
    return 'ui-test-customer-a';
  }
  return null;
}
