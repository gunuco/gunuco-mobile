import React from 'react';
import { ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/providers';

export type GLoaderProps = {
  size?: 'small' | 'large';
  overlay?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GLoader({ size = 'small', overlay = false, style }: GLoaderProps) {
  const theme = useTheme();

  const indicator = <ActivityIndicator size={size} color={theme.colors.brand.primary} />;

  if (!overlay) {
    return <View style={style}>{indicator}</View>;
  }

  return (
    <View
      style={[
        {
          ...StyleSheetAbsoluteFill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.overlay.scrim,
        },
        style,
      ]}
    >
      {indicator}
    </View>
  );
}

const StyleSheetAbsoluteFill = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};
