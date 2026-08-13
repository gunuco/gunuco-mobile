import React from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/src/providers';
import { GText } from './GText';

export type GInputProps = TextInputProps & {
  label?: string;
  helperText?: string;
  errorText?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function GInput({
  label,
  helperText,
  errorText,
  containerStyle,
  style,
  editable = true,
  ...rest
}: GInputProps) {
  const theme = useTheme();
  const hasError = Boolean(errorText);

  return (
    <View style={[{ gap: theme.spacing.xs }, containerStyle]}>
      {label ? <GText variant="label">{label}</GText> : null}
      <TextInput
        {...rest}
        editable={editable}
        placeholderTextColor={theme.colors.text.disabled}
        accessibilityState={{ disabled: !editable }}
        style={[
          {
            minHeight: theme.dimensions.inputHeight,
            borderRadius: theme.radius.lg,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: hasError ? theme.colors.semantic.danger : theme.colors.border.default,
            backgroundColor: theme.colors.bg.surface,
            paddingHorizontal: theme.spacing.md,
            color: theme.colors.text.primary,
            opacity: editable ? 1 : 0.6,
            ...theme.typography.bodyMd,
          },
          style,
        ]}
      />
      {hasError ? (
        <GText variant="caption" color="danger">
          {errorText}
        </GText>
      ) : helperText ? (
        <GText variant="caption" color="secondary">
          {helperText}
        </GText>
      ) : null}
    </View>
  );
}
