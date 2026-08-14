import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GButton, GCard, GText, Header } from '@/src/components';
import { persistThemePreference } from '@/src/services/themePreference';
import { useAuth } from '@/src/hooks';
import { useAppDispatch, useAppSelector } from '@/src/store';
import { useTheme } from '@/src/providers';
import { formatPhoneDisplay } from '@/src/utils';

export default function ProfileTabScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const preference = useAppSelector((state) => state.settings.themePreference);
  const { isAuthenticated, name, phone, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Profile" />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing['3xl'],
          gap: theme.spacing.lg,
        }}
      >
        <GCard style={{ gap: theme.spacing.sm }}>
          {isAuthenticated ? (
            <>
              <GText variant="titleMd">{name?.trim() ? name : 'GUNUCO customer'}</GText>
              {phone ? (
                <GText variant="bodyMd" color="secondary">
                  {formatPhoneDisplay(phone)}
                </GText>
              ) : null}
              <GText variant="caption" color="secondary">
                You’re signed in. Account details expand in later phases.
              </GText>
              <GButton
                title="Log out"
                variant="danger"
                fullWidth
                loading={loggingOut}
                onPress={onLogout}
              />
            </>
          ) : (
            <>
              <GText variant="titleMd">Guest</GText>
              <GText variant="bodyMd" color="secondary">
                Browse freely. Sign in with your mobile number when you’re ready to checkout or
                manage your account.
              </GText>
              <GButton
                title="Sign in with phone"
                fullWidth
                onPress={() => router.push('/(auth)/phone')}
              />
            </>
          )}
        </GCard>

        <GCard style={{ gap: theme.spacing.sm }}>
          <GText variant="label">Account</GText>
          <GButton
            title="Wishlist"
            variant="secondary"
            fullWidth
            onPress={() => router.push('/wishlist')}
          />
        </GCard>

        <GCard style={{ gap: theme.spacing.sm }}>
          <GText variant="label">Appearance</GText>
          <GText variant="caption" color="secondary">
            Current preference: {preference}
          </GText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            <GButton
              title="Light"
              size="sm"
              variant="secondary"
              onPress={() => {
                void persistThemePreference(dispatch, 'light');
              }}
            />
            <GButton
              title="Dark"
              size="sm"
              variant="secondary"
              onPress={() => {
                void persistThemePreference(dispatch, 'dark');
              }}
            />
            <GButton
              title="System"
              size="sm"
              variant="ghost"
              onPress={() => {
                void persistThemePreference(dispatch, 'system');
              }}
            />
          </View>
        </GCard>

        {__DEV__ ? (
          <GButton
            title="Design system gallery"
            variant="tertiary"
            fullWidth
            onPress={() => router.push('/design-system')}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
