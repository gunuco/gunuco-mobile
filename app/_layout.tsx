import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AppProviders, useTheme } from '@/src/providers';
import { useSessionBootstrap } from '@/src/hooks';
import { BootstrapScreen } from '@/src/components/layout/BootstrapScreen';
import { SessionExpiredModal } from '@/src/components/layout/SessionExpiredModal';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const theme = useTheme();
  const { isBootstrapping } = useSessionBootstrap();

  if (isBootstrapping) {
    return <BootstrapScreen />;
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
        <Stack.Screen
          name="(auth)"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="design-system" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <SessionExpiredModal />
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
