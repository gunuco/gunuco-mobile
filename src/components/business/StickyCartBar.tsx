import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import { useGetCartQuery } from '@/src/store';
import { getCartBadgeCount } from '@/src/utils/cart';
import { GBadge } from '../ui/GBadge';
import { GButton } from '../ui/GButton';
import { GIcon } from '../ui/GIcon';
import { GText } from '../ui/GText';

export type StickyCartBarProps = {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  onAddPress: () => void;
  onCartPress: () => void;
  message?: string | null;
  messageTone?: 'success' | 'danger';
};

export function StickyCartBar({
  title,
  loading,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  onAddPress,
  onCartPress,
  message,
  messageTone = 'danger',
}: StickyCartBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const cartQuery = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const badge = getCartBadgeCount(cartQuery.data);

  return (
    <View
      style={{
        backgroundColor: theme.colors.bg.surface,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: Math.max(insets.bottom, theme.spacing.md),
        flexDirection: 'column',
        gap: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.default,
        ...theme.shadows.md,
      }}
    >
      {message ? (
        <GText variant="bodySm" color={messageTone === 'success' ? 'success' : 'danger'}>
          {message}
        </GText>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={badge > 0 ? `Cart, ${badge} items` : 'Open cart'}
          onPress={onCartPress}
          style={{
            width: theme.dimensions.buttonHeight.lg,
            height: theme.dimensions.buttonHeight.lg,
            borderRadius: theme.radius.xl,
            borderWidth: 1,
            borderColor: theme.colors.border.default,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GIcon name="cart-outline" size="md" />
          {badge > 0 ? (
            <View style={{ position: 'absolute', top: 4, right: 4 }}>
              <GBadge label={String(badge)} variant="danger" />
            </View>
          ) : null}
        </Pressable>
        <View style={{ flex: 1 }}>
          <GButton
            title={title}
            size="lg"
            fullWidth
            loading={loading}
            disabled={disabled}
            onPress={onAddPress}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            style={{ borderRadius: theme.radius.pill }}
          />
        </View>
      </View>
    </View>
  );
}
