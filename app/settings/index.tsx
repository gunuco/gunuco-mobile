import React, { useCallback, useState } from 'react';
import { Linking, Platform, ScrollView, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import { useAppSelector } from '@/src/store';
import { persistThemePreference } from '@/src/services/themePreference';
import { useAppDispatch } from '@/src/store/hooks';
import { getAppVersion } from '@/src/services/appVersion';
import { APP_NAME } from '@/src/constants';
import type { PushPermissionState } from '@/src/types/notification';
import {
  getPushPermissionState,
  registerPushTokenIfAllowed,
  requestPushPermission,
} from '@/src/services/pushNotifications';
import { legalHref } from '@/src/utils/navigation';
import { GButton, GText, Header, ListRow, RadioRow, SettingSection } from '@/src/components';
import type { ThemePreference } from '@/src/store/slices/settingsSlice';

function permissionCopy(state: PushPermissionState | null): string {
  switch (state) {
    case 'granted':
      return 'Allowed on this device';
    case 'denied':
      return 'Turned off in system settings';
    case 'unavailable':
      return 'Not available on this device';
    case 'not_requested':
      return 'Not enabled yet';
    default:
      return 'Checking…';
  }
}

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const preference = useAppSelector((state) => state.settings.themePreference);
  const { isAuthenticated, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [permission, setPermission] = useState<PushPermissionState | null>(null);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const version = getAppVersion();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/profile');
  };

  useFocusEffect(
    useCallback(() => {
      void getPushPermissionState().then(setPermission);
    }, []),
  );

  const setTheme = (next: ThemePreference) => {
    void persistThemePreference(dispatch, next);
  };

  const onNotificationAction = async () => {
    if (permission === 'denied') {
      await Linking.openSettings();
      return;
    }
    if (permission === 'not_requested') {
      setPermissionLoading(true);
      try {
        const next = await requestPushPermission();
        setPermission(next);
        if (next === 'granted') {
          await registerPushTokenIfAllowed();
        }
      } finally {
        setPermissionLoading(false);
      }
    }
  };

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/(tabs)/profile');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Settings" showBack onBackPress={goBack} />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing['3xl'],
          gap: theme.spacing.lg,
        }}
      >
        <SettingSection title="Appearance">
          <RadioRow
            label="System"
            selected={preference === 'system'}
            onPress={() => setTheme('system')}
            accessibilityLabel="System theme"
          />
          <RadioRow
            label="Light"
            selected={preference === 'light'}
            onPress={() => setTheme('light')}
            accessibilityLabel="Light theme"
          />
          <RadioRow
            label="Dark"
            selected={preference === 'dark'}
            onPress={() => setTheme('dark')}
            accessibilityLabel="Dark theme"
          />
        </SettingSection>

        <SettingSection title="Notifications">
          <GText variant="bodyMd">{permissionCopy(permission)}</GText>
          <GText variant="caption" color="secondary">
            This is your device permission. GUNUCO does not have a separate notification preference
            API yet.
          </GText>
          {permission === 'not_requested' ? (
            <GButton
              title="Allow Notifications"
              onPress={() => {
                void onNotificationAction();
              }}
              loading={permissionLoading}
              accessibilityLabel="Allow Notifications"
            />
          ) : null}
          {permission === 'denied' && (Platform.OS === 'ios' || Platform.OS === 'android') ? (
            <GButton
              title="Open system settings"
              variant="secondary"
              onPress={() => {
                void onNotificationAction();
              }}
              accessibilityLabel="Open system settings"
            />
          ) : null}
        </SettingSection>

        <SettingSection title="About">
          <ListRow title={APP_NAME} subtitle={`Version ${version}`} showChevron={false} />
        </SettingSection>

        <SettingSection title="Legal">
          <ListRow
            title="Legal"
            subtitle="Terms, Privacy, Refund, Cancellation"
            onPress={() => router.push(legalHref())}
          />
        </SettingSection>

        {isAuthenticated ? (
          <GButton
            title="Log out"
            variant="danger"
            fullWidth
            loading={loggingOut}
            onPress={() => {
              void onLogout();
            }}
            accessibilityLabel="Log out"
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
