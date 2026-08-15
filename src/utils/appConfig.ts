import { Platform } from 'react-native';
import type { AppConfig, AppGateResult, AppStoreUrls } from '@/src/types/appConfig';
import { isVersionLower } from './semver';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function unwrap(response: unknown): Record<string, unknown> {
  const root = asRecord(response) ?? {};
  return asRecord(root.data) ?? asRecord(root.config) ?? asRecord(root.appConfig) ?? root;
}

function normalizeStoreUrls(raw: unknown): AppStoreUrls | undefined {
  const rec = asRecord(raw);
  if (!rec) {
    return undefined;
  }
  const android =
    asString(rec.android) ??
    asString(rec.playStore) ??
    asString(rec.googlePlay) ??
    asString(rec.play);
  const ios =
    asString(rec.ios) ?? asString(rec.appStore) ?? asString(rec.apple) ?? asString(rec.itunes);
  if (!android && !ios) {
    return undefined;
  }
  return { android, ios };
}

export function normalizeAppConfig(response: unknown): AppConfig {
  const data = unwrap(response);
  return {
    minVersion: asString(data.minVersion) ?? asString(data.minSupportedVersion),
    latestVersion: asString(data.latestVersion) ?? asString(data.latest),
    forceUpdate: asBoolean(data.forceUpdate) ?? false,
    maintenanceMode: asBoolean(data.maintenanceMode) ?? asBoolean(data.maintenance) ?? false,
    maintenanceMessage: asString(data.maintenanceMessage) ?? asString(data.message),
    storeUrls: normalizeStoreUrls(data.storeUrls) ?? normalizeStoreUrls(data.stores),
  };
}

export function storeUrlForPlatform(urls: AppStoreUrls | undefined): string | null {
  if (!urls) {
    return null;
  }
  if (Platform.OS === 'ios') {
    return urls.ios ?? null;
  }
  if (Platform.OS === 'android') {
    return urls.android ?? null;
  }
  return urls.android ?? urls.ios ?? null;
}

/**
 * Maintenance takes priority over force update.
 * Config fetch failure must not call this with a fake maintenance payload.
 */
export function evaluateAppGate(config: AppConfig, currentVersion: string): AppGateResult {
  if (config.maintenanceMode) {
    return {
      gate: 'maintenance',
      maintenanceMessage:
        config.maintenanceMessage ?? 'GUNUCO is temporarily unavailable. Please try again later.',
      storeUrl: storeUrlForPlatform(config.storeUrls),
    };
  }

  const belowMinimum = Boolean(
    config.minVersion && isVersionLower(currentVersion, config.minVersion),
  );
  if (config.forceUpdate || belowMinimum) {
    return {
      gate: 'force_update',
      maintenanceMessage: null,
      storeUrl: storeUrlForPlatform(config.storeUrls),
    };
  }

  return {
    gate: 'none',
    maintenanceMessage: null,
    storeUrl: storeUrlForPlatform(config.storeUrls),
  };
}
