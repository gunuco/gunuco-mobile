import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/providers';
import type { ShadowKey } from '@/src/design-system';

export type GCardProps = {
  children: React.ReactNode;
  padded?: boolean;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GCard({ children, padded = true, elevated = true, style }: GCardProps) {
  const theme = useTheme();
  const shadowKey: ShadowKey = elevated ? 'sm' : 'none';

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.bg.surface,
          borderRadius: theme.radius.lg,
          borderWidth: theme.mode === 'dark' ? 1 : 0,
          borderColor: theme.colors.border.default,
          padding: padded ? theme.spacing.md : 0,
          overflow: 'hidden',
          ...theme.shadows[shadowKey],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
