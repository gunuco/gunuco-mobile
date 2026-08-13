import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { HomeOffer } from '@/src/types';
import { GCard } from '../ui/GCard';
import { GImage } from '../ui/GImage';
import { GText } from '../ui/GText';
import { GBadge } from '../ui/GBadge';

export type OfferCardProps = {
  offer: HomeOffer;
  onPress?: () => void;
};

function OfferCardComponent({ offer, onPress }: OfferCardProps) {
  const theme = useTheme();

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={offer.title} onPress={onPress}>
      <GCard
        style={{
          width: 200,
          gap: theme.spacing.sm,
          minHeight: 148,
        }}
      >
        {offer.imageUrl ? (
          <GImage
            uri={offer.imageUrl}
            width={168}
            height={72}
            borderRadius={theme.radius.md}
            accessibilityLabel={offer.title}
          />
        ) : (
          <View
            style={{
              height: 72,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.bg.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GBadge label={offer.badgeLabel ?? 'Offer'} variant="discount" />
          </View>
        )}
        <GText variant="label" numberOfLines={2}>
          {offer.title}
        </GText>
        {offer.subtitle ? (
          <GText variant="caption" color="secondary" numberOfLines={2}>
            {offer.subtitle}
          </GText>
        ) : null}
      </GCard>
    </Pressable>
  );
}

export const OfferCard = memo(OfferCardComponent);
