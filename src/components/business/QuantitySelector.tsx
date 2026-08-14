import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GText } from '../ui/GText';
import { GIcon } from '../ui/GIcon';

export type QuantitySelectorProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  loading?: boolean;
};

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  loading = false,
}: QuantitySelectorProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const canDecrement = !isDisabled && value > min;
  const canIncrement = !isDisabled && value < max;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.default,
        overflow: 'hidden',
        opacity: isDisabled ? 0.5 : 1,
      }}
      accessibilityLabel="Quantity"
      accessibilityValue={{ min, max, now: value }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        disabled={!canDecrement}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={{
          width: theme.dimensions.touchMin,
          height: theme.dimensions.touchMin,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GIcon
          name="remove"
          color={canDecrement ? theme.colors.text.primary : theme.colors.text.disabled}
        />
      </Pressable>
      <GText variant="label" style={{ minWidth: 28, textAlign: 'center' }}>
        {value}
      </GText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        disabled={!canIncrement}
        onPress={() => onChange(Math.min(max, value + 1))}
        style={{
          width: theme.dimensions.touchMin,
          height: theme.dimensions.touchMin,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GIcon
          name="add"
          color={canIncrement ? theme.colors.text.primary : theme.colors.text.disabled}
        />
      </Pressable>
    </View>
  );
}
