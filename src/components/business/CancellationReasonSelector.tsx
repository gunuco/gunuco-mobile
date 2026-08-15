import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GText } from '../ui/GText';
import { GIcon } from '../ui/GIcon';
export type CancellationReasonSelectorProps = {
  reasons: readonly { code: string; label: string }[];
  value?: string;
  onChange: (code: string) => void;
};

export function CancellationReasonSelector({
  reasons,
  value,
  onChange,
}: CancellationReasonSelectorProps) {
  const theme = useTheme();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Cancellation reason">
      {reasons.map((reason) => {
        const selected = reason.code === value;
        return (
          <Pressable
            key={reason.code}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={reason.label}
            onPress={() => onChange(reason.code)}
            style={{
              minHeight: theme.dimensions.touchMin,
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.sm,
              paddingVertical: theme.spacing.sm,
            }}
          >
            <GIcon
              name={selected ? 'radio-button-on' : 'radio-button-off'}
              color={selected ? theme.colors.brand.primary : theme.colors.text.secondary}
            />
            <GText variant="bodyMd">{reason.label}</GText>
          </Pressable>
        );
      })}
    </View>
  );
}
