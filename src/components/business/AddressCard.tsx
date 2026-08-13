import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { AddressSummary } from '@/src/types';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';
import { GBadge } from '../ui/GBadge';
import { GIcon } from '../ui/GIcon';

export type AddressCardProps = {
  address: AddressSummary;
  selected?: boolean;
  onPress?: () => void;
  onEditPress?: () => void;
};

export function AddressCard({ address, selected, onPress, onEditPress }: AddressCardProps) {
  const theme = useTheme();
  const line = [address.line1, address.line2, address.city, address.pincode]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <GCard
        style={{
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? theme.colors.brand.primary : theme.colors.border.default,
          gap: theme.spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <GIcon name="location-outline" color={theme.colors.brand.primary} />
          <GText variant="label" style={{ flex: 1 }}>
            {address.name}
          </GText>
          <GBadge label={address.addressType} />
          {address.isDefault ? <GBadge label="Default" variant="info" /> : null}
        </View>
        <GText variant="bodyMd" color="secondary">
          {line}
        </GText>
        {address.phone ? (
          <GText variant="caption" color="secondary">
            {address.phone}
          </GText>
        ) : null}
        {onEditPress ? (
          <Pressable accessibilityRole="button" onPress={onEditPress} hitSlop={8}>
            <GText variant="label" color="brand">
              Edit
            </GText>
          </Pressable>
        ) : null}
      </GCard>
    </Pressable>
  );
}
