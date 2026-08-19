import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GButton,
  GCard,
  GDivider,
  GIcon,
  GImage,
  GText,
  Header,
  ListRow,
  type GIconName,
} from '@/src/components';
import { useAuth } from '@/src/hooks';
import { useGetMeQuery, useGetStoreCreditQuery } from '@/src/store';
import { useTheme } from '@/src/providers';
import { formatPhoneDisplay } from '@/src/utils';
import { formatPaise } from '@/src/utils/money';
import { clearAuthIntent, setAuthIntent } from '@/src/services/authIntent';
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

function ProfileShortcut({
  iconName,
  label,
  onPress,
}: {
  iconName: GIconName;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 88,
        backgroundColor: theme.colors.bg.surface,
        borderRadius: theme.radius.lg,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        opacity: pressed ? 0.75 : 1,
        ...theme.shadows.sm,
      })}
    >
      <GIcon name={iconName} color={theme.colors.text.primary} />
      <GText variant="caption" align="center" numberOfLines={2}>
        {label}
      </GText>
    </Pressable>
  );
}

export default function ProfileTabScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, name, phone, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const meQuery = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const creditQuery = useGetStoreCreditQuery(undefined, { skip: !isAuthenticated });
  const refetch = meQuery.refetch;
  const displayName = meQuery.data?.name?.trim() || name?.trim() || 'GUNUCO customer';
  const displayPhone = meQuery.data?.phone ?? phone;
  const creditPaise = creditQuery.data?.balancePaise ?? 0;

  const refetchCredit = creditQuery.refetch;

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        void refetch();
        void refetchCredit();
      }
    }, [isAuthenticated, refetch, refetchCredit]),
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

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Profile" showBack onBackPress={goBack} bordered={false} />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing['3xl'],
          gap: theme.spacing.lg,
        }}
        refreshControl={
          isAuthenticated ? (
            <RefreshControl
              refreshing={meQuery.isFetching || creditQuery.isFetching}
              onRefresh={() => {
                void refetch();
                void creditQuery.refetch();
              }}
              tintColor={theme.colors.brand.primary}
              colors={[theme.colors.brand.primary]}
            />
          ) : undefined
        }
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          {meQuery.data?.profileImage ? (
            <GImage
              uri={meQuery.data.profileImage}
              width={64}
              height={64}
              borderRadius={32}
              accessibilityLabel="Profile photo"
            />
          ) : (
            <View
              accessibilityLabel="Profile photo"
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: theme.colors.brand.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GIcon name="person" color={theme.colors.text.inverse} />
            </View>
          )}
          <View style={{ flex: 1, gap: 2 }}>
            {isAuthenticated ? (
              <>
                <GText variant="titleMd">{displayName}</GText>
                {displayPhone ? (
                  <GText variant="bodyMd" color="secondary">
                    {formatPhoneDisplay(displayPhone)}
                  </GText>
                ) : null}
              </>
            ) : (
              <>
                <GText variant="titleMd">Guest</GText>
                <GText variant="bodyMd" color="secondary">
                  Sign in to manage orders, addresses, and store credit.
                </GText>
              </>
            )}
          </View>
        </View>

        {!isAuthenticated ? (
          <GButton
            title="Sign in with phone"
            fullWidth
            onPress={() => {
              clearAuthIntent();
              router.push('/(auth)/phone');
            }}
          />
        ) : null}

        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <ProfileShortcut
            iconName="bag-handle-outline"
            label="Your Orders"
            onPress={() => requireAuth(ordersHref(), String(ordersHref()))}
          />
          <ProfileShortcut
            iconName="chatbubbles-outline"
            label="Help & Support"
            onPress={() => requireAuth(supportHref(), '/support')}
          />
          <ProfileShortcut
            iconName="heart-outline"
            label="Your Wishlist"
            onPress={() => router.push('/wishlist')}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Store credit"
          onPress={() => requireAuth(storeCreditHref(), '/store-credit')}
          style={({ pressed }) => ({
            backgroundColor: theme.colors.bg.surfaceMuted,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.md,
            gap: theme.spacing.md,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.colors.brand.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GIcon name="wallet" size="sm" color={theme.colors.text.inverse} />
            </View>
            <GText variant="label" style={{ flex: 1 }}>
              GUNUCO Store Credit
            </GText>
            <GIcon name="chevron-forward" size="sm" color={theme.colors.text.secondary} />
          </View>
          <GDivider />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <GText variant="bodyMd" style={{ flex: 1 }}>
              Available Balance {formatPaise(isAuthenticated ? creditPaise : 0)}
            </GText>
            <GButton
              title="View"
              variant="secondary"
              size="sm"
              onPress={() => requireAuth(storeCreditHref(), '/store-credit')}
            />
          </View>
        </Pressable>

        <View style={{ gap: theme.spacing.sm }}>
          <GText variant="titleSm">Your Information</GText>
          <GCard padded={false}>
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              {isAuthenticated ? (
                <>
                  <ListRow
                    title="Edit Profile"
                    iconName="person-outline"
                    onPress={() => router.push(editProfileHref())}
                  />
                  <ListRow
                    title="Change Phone"
                    iconName="call-outline"
                    onPress={() => router.push(changePhoneHref())}
                  />
                </>
              ) : null}
              <ListRow
                title="Your Orders"
                iconName="bag-handle-outline"
                onPress={() => requireAuth(ordersHref(), String(ordersHref()))}
              />
              <ListRow
                title="Your Wishlist"
                iconName="heart-outline"
                onPress={() => router.push('/wishlist')}
              />
              <ListRow
                title="Addresses"
                iconName="location-outline"
                onPress={() => requireAuth(addressBookHref(), '/addresses')}
              />
              <ListRow
                title="Notifications"
                iconName="notifications-outline"
                onPress={() => requireAuth(notificationsHref(), '/notifications')}
              />
              <ListRow
                title="Help & Support"
                iconName="chatbubbles-outline"
                onPress={() => requireAuth(supportHref(), '/support')}
              />
              <ListRow
                title="Settings"
                iconName="settings-outline"
                onPress={() => router.push(settingsHref())}
              />
              <ListRow
                title="Legal"
                iconName="document-text-outline"
                onPress={() => router.push(legalHref())}
              />
            </View>
          </GCard>
        </View>

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
