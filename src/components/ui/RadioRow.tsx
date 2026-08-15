import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GText } from './GText';
import { GIcon } from './GIcon';

export type RadioRowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
};

export function RadioRow({ label, selected, onPress, accessibilityLabel }: RadioRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        minHeight: theme.dimensions.touchMin,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
      }}
    >
      <GIcon
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        color={selected ? theme.colors.brand.primary : theme.colors.text.secondary}
      />
      <View style={{ flex: 1 }}>
        <GText variant="bodyMd">{label}</GText>
      </View>
    </Pressable>
  );
}
