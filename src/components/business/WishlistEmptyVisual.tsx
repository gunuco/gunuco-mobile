import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GIcon } from '../ui/GIcon';

export function WishlistEmptyVisual() {
  const theme = useTheme();
  const bubble = (icon: 'cafe-outline' | 'gift-outline' | 'restaurant-outline', offset: object) => (
    <View
      key={icon}
      style={{
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.bg.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.sm,
        ...offset,
      }}
    >
      <GIcon name="restaurant-outline" size="md" color={theme.colors.brand.secondary} />
      <View
        style={{
          position: 'absolute',
          right: -2,
          bottom: -2,
          width: 18,
          height: 18,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.brand.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GIcon name="heart" size={10} color={theme.colors.text.inverse} />
      </View>
    </View>
  );

  return (
    <View
      accessible
      accessibilityLabel="Empty wishlist illustration"
      style={{
        width: 220,
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {bubble('cafe-outline', { left: 8, top: 28 })}
      {bubble('gift-outline', { right: 4, top: 18 })}
      {bubble('restaurant-outline', { right: 28, bottom: 16 })}
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.brand.primary,
          alignItems: 'center',
          justifyContent: 'center',
          ...theme.shadows.md,
        }}
      >
        <GIcon name="heart" size={40} color={theme.colors.text.inverse} />
      </View>
    </View>
  );
}
