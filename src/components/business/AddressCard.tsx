import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { AddressSummary } from '@/src/types';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';
import { GBadge } from '../ui/GBadge';
import { GIcon, type GIconName } from '../ui/GIcon';

export type AddressCardProps = {
  address: AddressSummary;
  selected?: boolean;
  variant?: 'default' | 'select';
  onPress?: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
  onSetDefaultPress?: () => void;
};

function iconForType(addressType: string): GIconName {
  const type = addressType.toLowerCase();
  if (type === 'home') {
    return 'home-outline';
  }
  if (type === 'office' || type === 'work') {
    return 'briefcase-outline';
  }
  return 'location-outline';
}

function formatDistance(distanceKm?: number | null): string | null {
  if (typeof distanceKm !== 'number' || !Number.isFinite(distanceKm)) {
    return null;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function AddressCard({
  address,
  selected,
  variant = 'default',
  onPress,
  onEditPress,
  onDeletePress,
  onSetDefaultPress,
}: AddressCardProps) {
  const theme = useTheme();
  const line = [address.line1, address.line2, address.city, address.pincode]
    .filter(Boolean)
    .join(', ');
  const distance = formatDistance(address.distanceKm);
  const label = address.addressType || address.name;

  if (variant === 'select') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${selected ? 'Selected address' : 'Address'} ${label}`}
        accessibilityState={{ selected: !!selected }}
        onPress={onPress}
        style={{
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          backgroundColor: selected ? theme.colors.bg.surfaceMuted : theme.colors.bg.surface,
          flexDirection: 'row',
          gap: theme.spacing.md,
          alignItems: 'flex-start',
        }}
      >
        <GIcon name={iconForType(address.addressType)} color={theme.colors.brand.primary} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
            <GText variant="label">{label}</GText>
            {distance ? (
              <GText variant="caption" color="secondary">
                • {distance}
              </GText>
            ) : null}
          </View>
          <GText variant="bodySm" color="secondary" numberOfLines={2}>
            {line}
          </GText>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${selected ? 'Selected address' : 'Address'} ${address.name}`}
      onPress={onPress}
    >
      <GCard
        style={{
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? theme.colors.brand.primary : theme.colors.border.default,
          gap: theme.spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <GIcon name={iconForType(address.addressType)} color={theme.colors.brand.primary} />
          <GText variant="label" style={{ flex: 1 }}>
            {label}
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
        {onEditPress || onDeletePress || onSetDefaultPress ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
            {onEditPress ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Edit ${address.name}`}
                onPress={onEditPress}
                hitSlop={8}
              >
                <GText variant="label" color="brand">
                  Edit
                </GText>
              </Pressable>
            ) : null}
            {onSetDefaultPress && !address.isDefault ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Set ${address.name} as default`}
                onPress={onSetDefaultPress}
                hitSlop={8}
              >
                <GText variant="label" color="brand">
                  Set default
                </GText>
              </Pressable>
            ) : null}
            {onDeletePress ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Delete ${address.name}`}
                onPress={onDeletePress}
                hitSlop={8}
              >
                <GText variant="label" color="danger">
                  Delete
                </GText>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </GCard>
    </Pressable>
  );
}
