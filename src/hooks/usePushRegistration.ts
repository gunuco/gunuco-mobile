import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './useAuth';
import { useAppSelector } from '@/src/store/hooks';
import {
  registerPushTokenIfAllowed,
  subscribeToPushTokenRefresh,
} from '@/src/services/pushNotifications';

/** Register the device push token after auth, not on every render. */
export function usePushRegistration() {
  const { isAuthenticated } = useAuth();
  const gate = useAppSelector((state) => state.appLifecycle.gate);

  useEffect(() => {
    if (
      !isAuthenticated ||
      gate !== 'none' ||
      (Platform.OS !== 'ios' && Platform.OS !== 'android')
    ) {
      return;
    }
    void registerPushTokenIfAllowed();
    const subscription = subscribeToPushTokenRefresh();
    return () => {
      subscription.remove();
    };
  }, [gate, isAuthenticated]);
}
