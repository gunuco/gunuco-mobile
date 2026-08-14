export type AppEnvironment = 'development' | 'staging' | 'production';

type EnvConfig = {
  appEnv: AppEnvironment;
  apiBaseUrl: string;
  enableLogging: boolean;
  googleMapsApiKey: string;
  razorpayKeyId: string;
};

function resolveAppEnv(): AppEnvironment {
  const raw = process.env.EXPO_PUBLIC_APP_ENV;
  if (raw === 'staging' || raw === 'production' || raw === 'development') {
    return raw;
  }
  return __DEV__ ? 'development' : 'production';
}

/**
 * Environment-based API configuration.
 * Never hard-code production URLs in components — read via `env`.
 */
export const env: EnvConfig = {
  appEnv: resolveAppEnv(),
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.dev.gunuco.local',
  enableLogging: process.env.EXPO_PUBLIC_ENABLE_LOGGING === 'true' || __DEV__,
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  razorpayKeyId: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ?? '',
};
