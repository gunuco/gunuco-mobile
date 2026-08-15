import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { PushPermissionState, PushPlatform } from '@/src/types/notification';
import { store } from '@/src/store/store';
import { notificationApi } from '@/src/store/api/notificationApi';

let lastRegisteredToken: string | null = null;
let registering = false;

if (Platform.OS === 'ios' || Platform.OS === 'android') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function platformForPush(): PushPlatform | null {
  if (Platform.OS === 'ios') {
    return 'ios';
  }
  if (Platform.OS === 'android') {
    return 'android';
  }
  return null;
}

export async function getPushPermissionState(): Promise<PushPermissionState> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return 'unavailable';
  }
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) {
      return 'granted';
    }
    if (settings.status === 'undetermined') {
      return 'not_requested';
    }
    return 'denied';
  } catch {
    return 'unavailable';
  }
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync('default', {
    name: 'GUNUCO',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function requestPushPermission(): Promise<PushPermissionState> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return 'unavailable';
  }
  const current = await getPushPermissionState();
  if (current === 'granted' || current === 'denied' || current === 'unavailable') {
    return current;
  }
  try {
    await ensureAndroidChannel();
    const result = await Notifications.requestPermissionsAsync();
    return result.granted
      ? 'granted'
      : result.status === 'undetermined'
        ? 'not_requested'
        : 'denied';
  } catch {
    return 'unavailable';
  }
}

/**
 * Register the native FCM/APNs device token after permission is granted.
 * Does not send a fake token. Skips duplicate posts of the same token.
 */
export async function registerPushTokenIfAllowed(): Promise<void> {
  const platform = platformForPush();
  if (!platform || registering) {
    return;
  }
  if (store.getState().appLifecycle.gate !== 'none') {
    return;
  }
  const permission = await getPushPermissionState();
  if (permission !== 'granted') {
    return;
  }

  registering = true;
  try {
    await ensureAndroidChannel();
    const deviceToken = await Notifications.getDevicePushTokenAsync();
    const token = typeof deviceToken.data === 'string' ? deviceToken.data.trim() : '';
    if (!token) {
      return;
    }
    if (store.getState().appLifecycle.gate !== 'none') {
      return;
    }
    if (lastRegisteredToken === token) {
      return;
    }
    await store.dispatch(notificationApi.endpoints.registerPushToken.initiate({ token, platform }));
    lastRegisteredToken = token;
  } catch {
    // Token unavailable (simulator / missing native creds) — do not fake a token.
  } finally {
    registering = false;
  }
}

export function clearRegisteredPushToken(): void {
  lastRegisteredToken = null;
}

export function subscribeToPushTokenRefresh(): { remove: () => void } {
  const subscription = Notifications.addPushTokenListener(() => {
    lastRegisteredToken = null;
    void registerPushTokenIfAllowed();
  });
  return subscription;
}
