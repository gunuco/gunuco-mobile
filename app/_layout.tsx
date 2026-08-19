import React, { useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AppProviders, useTheme } from '@/src/providers';
import { useNotificationDeepLinks, usePushRegistration, useSessionBootstrap } from '@/src/hooks';
import { BootstrapScreen } from '@/src/components/layout/BootstrapScreen';
import { SessionExpiredModal } from '@/src/components/layout/SessionExpiredModal';
import { MaintenanceScreen } from '@/src/components/layout/MaintenanceScreen';
import { ForceUpdateScreen } from '@/src/components/layout/ForceUpdateScreen';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { checkRemoteAppConfig } from '@/src/services/appConfig';
import { isSafeStoreUrl } from '@/src/utils/urls';
import { UiTestBadge } from '@/src/mocks/UiTestBadge';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { isBootstrapping } = useSessionBootstrap();
  const gate = useAppSelector((state) => state.appLifecycle.gate);
  const maintenanceMessage = useAppSelector((state) => state.appLifecycle.maintenanceMessage);
  const storeUrl = useAppSelector((state) => state.appLifecycle.storeUrl);
  const [retrying, setRetrying] = useState(false);
  const ready = !isBootstrapping && gate === 'none';

  usePushRegistration();
  useNotificationDeepLinks(ready);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        void checkRemoteAppConfig(dispatch);
      }
    });
    return () => {
      subscription.remove();
    };
  }, [dispatch, isBootstrapping]);

  if (isBootstrapping) {
    return <BootstrapScreen />;
  }

  if (gate === 'maintenance') {
    return (
      <>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <MaintenanceScreen
          message={maintenanceMessage}
          retrying={retrying}
          onRetry={() => {
            void (async () => {
              setRetrying(true);
              try {
                await checkRemoteAppConfig(dispatch);
              } finally {
                setRetrying(false);
              }
            })();
          }}
        />
        <UiTestBadge />
      </>
    );
  }

  if (gate === 'force_update') {
    const storeAvailable = Boolean(storeUrl && isSafeStoreUrl(storeUrl));
    return (
      <>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <ForceUpdateScreen
          storeAvailable={storeAvailable}
          onUpdate={
            storeAvailable
              ? () => {
                  if (storeUrl && isSafeStoreUrl(storeUrl)) {
                    void Linking.openURL(storeUrl);
                  }
                }
              : undefined
          }
        />
        <UiTestBadge />
      </>
    );
  }

  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.bg.canvas },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="category" />
        <Stack.Screen name="product" />
        <Stack.Screen name="wishlist" />
        <Stack.Screen name="review" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="addresses" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="order-confirmation" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="support" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="legal" />
        <Stack.Screen name="store-credit" />
        <Stack.Screen
          name="(auth)"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="design-system" />
        <Stack.Screen name="ui-test" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <SessionExpiredModal />
      <UiTestBadge />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
