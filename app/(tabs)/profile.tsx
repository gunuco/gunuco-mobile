import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GButton, GCard, GImage, GText, Header, ListRow } from '@/src/components';
import { useAuth } from '@/src/hooks';
import { useGetMeQuery } from '@/src/store';
import { useTheme } from '@/src/providers';
import { formatPhoneDisplay } from '@/src/utils';
import { setAuthIntent } from '@/src/services/authIntent';
import {
  addressBookHref,
  changePhoneHref,
  editProfileHref,
  legalHref,
  notificationsHref,
  ordersHref,
  settingsHref,
  storeCreditHref,
  supportHref,
} from '@/src/utils/navigation';

export default function ProfileTabScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, name, phone, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const meQuery = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const refetch = meQuery.refetch;
  const displayName = meQuery.data?.name?.trim() || name?.trim() || 'GUNUCO customer';
  const displayPhone = meQuery.data?.phone ?? phone;

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        void refetch();
      }
    }, [isAuthenticated, refetch]),
  );

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const requireAuth = (href: Href, returnTo: string) => {
    if (!isAuthenticated) {
      setAuthIntent({ returnTo });
      router.push('/(auth)/phone');
      return;
    }
    router.push(href);
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
        refreshControl={
          isAuthenticated ? (
            <RefreshControl
              refreshing={meQuery.isFetching}
              onRefresh={() => void refetch()}
              tintColor={theme.colors.brand.primary}
              colors={[theme.colors.brand.primary]}
            />
          ) : undefined
        }
      >
        <GCard style={{ gap: theme.spacing.sm }}>
          {isAuthenticated ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <GImage
                  uri={meQuery.data?.profileImage}
                  width={56}
                  height={56}
                  borderRadius={28}
                  accessibilityLabel="Profile photo"
                />
                <View style={{ flex: 1, gap: 2 }}>
                  <GText variant="titleMd">{displayName}</GText>
                  {displayPhone ? (
                    <GText variant="bodyMd" color="secondary">
                      {formatPhoneDisplay(displayPhone)}
                    </GText>
                  ) : null}
                </View>
              </View>
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

        <GCard padded={false}>
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            {isAuthenticated ? (
              <>
                <ListRow title="Edit Profile" onPress={() => router.push(editProfileHref())} />
                <ListRow title="Change Phone" onPress={() => router.push(changePhoneHref())} />
              </>
            ) : null}
            <ListRow title="Orders" onPress={() => requireAuth(ordersHref(), '/orders')} />
            <ListRow title="Wishlist" onPress={() => router.push('/wishlist')} />
            <ListRow
              title="Addresses"
              onPress={() => requireAuth(addressBookHref(), '/addresses')}
            />
            <ListRow
              title="Store Credit"
              onPress={() => requireAuth(storeCreditHref(), '/store-credit')}
            />
            <ListRow
              title="Notifications"
              onPress={() => requireAuth(notificationsHref(), '/notifications')}
            />
            <ListRow title="Support" onPress={() => requireAuth(supportHref(), '/support')} />
            <ListRow title="Settings" onPress={() => router.push(settingsHref())} />
            <ListRow title="Legal" onPress={() => router.push(legalHref())} />
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
