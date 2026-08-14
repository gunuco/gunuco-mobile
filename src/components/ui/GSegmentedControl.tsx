import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GText } from './GText';

export type GSegmentedControlOption<T extends string> = {
  value: T;
  label: string;
};

export type GSegmentedControlProps<T extends string> = {
  options: GSegmentedControlOption<T>[];
  value: T;
  onChange: (next: T) => void;
  accessibilityLabel?: string;
  disabled?: boolean;
};

export function GSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  disabled = false,
}: GSegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.bg.surfaceMuted,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.xxs,
        gap: theme.spacing.xxs,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled }}
            accessibilityLabel={option.label}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              minHeight: theme.dimensions.touchMin,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radius.md,
              backgroundColor: selected ? theme.colors.bg.surface : 'transparent',
            }}
          >
            <GText variant="label" color={selected ? 'brand' : 'secondary'}>
              {option.label}
            </GText>
          </Pressable>
        );
      })}
    </View>
  );
}
