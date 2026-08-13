import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/src/providers';
import { GText } from './GText';

export type GButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
export type GButtonSize = 'sm' | 'md' | 'lg';

export type GButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: GButtonVariant;
  size?: GButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GButton({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  fullWidth,
  style,
  ...rest
}: GButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundByVariant: Record<GButtonVariant, string> = {
    primary: theme.colors.brand.primary,
    secondary: theme.colors.bg.surfaceMuted,
    tertiary: 'transparent',
    danger: theme.colors.semantic.danger,
    ghost: 'transparent',
  };

  const textColorByVariant: Record<GButtonVariant, 'inverse' | 'primary' | 'brand' | 'danger'> = {
    primary: 'inverse',
    secondary: 'primary',
    tertiary: 'brand',
    danger: 'inverse',
    ghost: 'brand',
  };

  const height = theme.dimensions.buttonHeight[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: height,
          borderRadius: theme.radius.lg,
          paddingHorizontal: theme.spacing.lg,
          backgroundColor:
            pressed && variant === 'primary'
              ? theme.colors.brand.primaryPressed
              : backgroundByVariant[variant],
          opacity: isDisabled ? 0.5 : 1,
          borderWidth: variant === 'tertiary' || variant === 'ghost' ? StyleSheet.hairlineWidth : 0,
          borderColor: theme.colors.border.default,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.text.inverse} />
      ) : (
        <GText variant="label" color={textColorByVariant[variant]}>
          {title}
        </GText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
