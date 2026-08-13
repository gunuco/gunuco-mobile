import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/providers';

export type GDividerProps = {
  vertical?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GDivider({ vertical = false, style }: GDividerProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        vertical
          ? {
              width: StyleSheet.hairlineWidth,
              alignSelf: 'stretch',
              backgroundColor: theme.colors.border.default,
            }
          : {
              height: StyleSheet.hairlineWidth,
              alignSelf: 'stretch',
              backgroundColor: theme.colors.border.default,
            },
        style,
      ]}
    />
  );
}
