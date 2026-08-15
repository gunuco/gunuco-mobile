import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GText } from './GText';
import { GIcon } from './GIcon';

export type ListRowProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  right?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
};

export function ListRow({
  title,
  subtitle,
  onPress,
  showChevron = true,
  right,
  accessibilityLabel,
  accessibilityHint,
  disabled,
}: ListRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: theme.dimensions.touchMin,
        paddingVertical: theme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
      })}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <GText variant="bodyMd">{title}</GText>
        {subtitle ? (
          <GText variant="caption" color="secondary">
            {subtitle}
          </GText>
        ) : null}
      </View>
      {right}
      {showChevron && onPress ? (
        <GIcon name="chevron-forward" size="sm" color={theme.colors.text.secondary} />
      ) : null}
    </Pressable>
  );
}
