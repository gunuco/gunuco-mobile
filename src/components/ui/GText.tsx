import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/src/providers';
import type { TextVariant } from '@/src/design-system';

export type GTextProps = TextProps & {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'disabled' | 'inverse' | 'brand' | 'danger' | 'success';
  align?: TextStyle['textAlign'];
};

export function GText({
  variant = 'bodyMd',
  color = 'primary',
  align,
  style,
  children,
  ...rest
}: GTextProps) {
  const theme = useTheme();

  const colorMap = {
    primary: theme.colors.text.primary,
    secondary: theme.colors.text.secondary,
    disabled: theme.colors.text.disabled,
    inverse: theme.colors.text.inverse,
    brand: theme.colors.brand.primary,
    danger: theme.colors.semantic.danger,
    success: theme.colors.semantic.success,
  } as const;

  return (
    <Text
      {...rest}
      style={[theme.typography[variant], { color: colorMap[color], textAlign: align }, style]}
    >
      {children}
    </Text>
  );
}
