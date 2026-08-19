export type AppEnvironment = 'development' | 'staging' | 'production';

type EnvConfig = {
  appEnv: AppEnvironment;
  apiBaseUrl: string;
  enableLogging: boolean;
  googleMapsApiKey: string;
  razorpayKeyId: string;
  /** Temporary UI-test mock transport. Default false. Never inferred from API failures. */
  uiTestMode: boolean;
};

function resolveAppEnv(): AppEnvironment {
  const raw = process.env.EXPO_PUBLIC_APP_ENV;
  if (raw === 'staging' || raw === 'production' || raw === 'development') {
    return raw;
  }
  return __DEV__ ? 'development' : 'production';
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

function resolveUiTestMode(): boolean {
  return process.env.EXPO_PUBLIC_UI_TEST_MODE === 'true';
}

/**
 * Production and staging must never fall back to a .local development host.
 * Set EXPO_PUBLIC_API_BASE_URL in the build; the host below is last-resort only.
 * UI test mode never uses a real backend host — requests are intercepted first.
 */
function resolveApiBaseUrl(appEnv: AppEnvironment, uiTestMode: boolean): string {
  if (uiTestMode) {
    return 'https://ui-test.invalid';
  }
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) {
    return stripTrailingSlash(fromEnv);
  }
  if (appEnv === 'production') {
    return 'https://api.gunuco.com';
  }
  if (appEnv === 'staging') {
    return 'https://api.staging.gunuco.com';
  }
  return 'https://api.dev.gunuco.local';
}

/**
 * Environment-based API configuration.
 * Never hard-code production URLs in components — read via `env`.
 */
const appEnv = resolveAppEnv();
const uiTestMode = resolveUiTestMode();

export const env: EnvConfig = {
  appEnv,
  apiBaseUrl: resolveApiBaseUrl(appEnv, uiTestMode),
  enableLogging: process.env.EXPO_PUBLIC_ENABLE_LOGGING === 'true' || __DEV__,
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  razorpayKeyId: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ?? '',
  uiTestMode,
};
