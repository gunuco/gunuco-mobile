import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/providers';
import { GText } from './GText';

export type GBadgeVariant = 'neutral' | 'premium' | 'discount' | 'success' | 'danger' | 'info';

export type GBadgeProps = {
  label: string;
  variant?: GBadgeVariant;
  style?: StyleProp<ViewStyle>;
};

export function GBadge({ label, variant = 'neutral', style }: GBadgeProps) {
  const theme = useTheme();

  const backgroundByVariant: Record<GBadgeVariant, string> = {
    neutral: theme.colors.bg.surfaceMuted,
    premium: theme.colors.badge.premium,
    discount: theme.colors.badge.discount,
    success: theme.colors.semantic.success,
    danger: theme.colors.semantic.danger,
    info: theme.colors.semantic.info,
  };

  const isNeutral = variant === 'neutral';

  return (
    <View
      style={[
        {
          minHeight: theme.dimensions.badgeMin,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xxs,
          borderRadius: theme.radius.pill,
          backgroundColor: backgroundByVariant[variant],
          alignSelf: 'flex-start',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <GText variant="caption" color={isNeutral ? 'primary' : 'inverse'}>
        {label}
      </GText>
    </View>
  );
}
