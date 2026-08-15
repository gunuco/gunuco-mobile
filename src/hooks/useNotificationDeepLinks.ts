import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { router, type Href } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuth } from './useAuth';
import { setAuthIntent } from '@/src/services/authIntent';
import { parsePushData } from '@/src/utils/notifications';
import { notificationDestinationHref, notificationDestinationPath } from '@/src/utils/navigation';

function dataFromResponse(response: Notifications.NotificationResponse): unknown {
  return response.notification.request.content.data;
}

function navigateFromNotification(
  response: Notifications.NotificationResponse,
  isAuthenticated: boolean,
) {
  const data = dataFromResponse(response);
  const link = parsePushData(data);
  if (!link) {
    return;
  }
  const href: Href = notificationDestinationHref(link);
  const path = notificationDestinationPath(link);
  if (!isAuthenticated) {
    setAuthIntent({ returnTo: path });
    router.push('/(auth)/phone');
    return;
  }
  router.push(href);
}

/**
 * Handles notification taps after bootstrap. Private destinations require auth.
 */
export function useNotificationDeepLinks(enabled: boolean) {
  const { isAuthenticated } = useAuth();
  const handledResponseIds = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled || (Platform.OS !== 'ios' && Platform.OS !== 'android')) {
      return;
    }

    const handleResponse = (response: Notifications.NotificationResponse) => {
      const responseId = response.notification.request.identifier;
      if (handledResponseIds.current.has(responseId)) {
        return;
      }
      handledResponseIds.current.add(responseId);
      navigateFromNotification(response, isAuthenticated);
    };

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleResponse(response);
      }
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
    return () => {
      subscription.remove();
    };
  }, [enabled, isAuthenticated]);
}
