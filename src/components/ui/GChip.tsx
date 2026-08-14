import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/providers';
import { GText } from './GText';
import { GIcon, type GIconName } from './GIcon';

export type GChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onClear?: () => void;
  iconName?: GIconName;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function GChip({
  label,
  selected,
  disabled,
  onPress,
  onClear,
  iconName,
  accessibilityLabel,
  style,
}: GChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          minHeight: theme.dimensions.chipMin,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: selected ? theme.colors.brand.primary : theme.colors.border.default,
          backgroundColor: selected ? theme.colors.brand.primary : theme.colors.bg.surface,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {iconName ? (
        <GIcon
          name={iconName}
          size="sm"
          color={selected ? theme.colors.text.inverse : theme.colors.text.secondary}
        />
      ) : null}
      <GText
        variant="caption"
        color={selected ? 'inverse' : disabled ? 'disabled' : 'primary'}
        style={disabled ? { textDecorationLine: 'line-through' } : undefined}
      >
        {label}
      </GText>
      {onClear ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Clear ${label}`}
          onPress={onClear}
          hitSlop={8}
        >
          <GIcon
            name="close"
            size="sm"
            color={selected ? theme.colors.text.inverse : theme.colors.text.secondary}
          />
        </Pressable>
      ) : null}
    </Pressable>
  );
}
