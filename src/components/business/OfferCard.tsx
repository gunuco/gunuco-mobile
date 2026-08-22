import { useTheme } from '@/src/providers';
import type { HomeOffer } from '@/src/types';
import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { GBadge } from '../ui/GBadge';
import { GCard } from '../ui/GCard';
import { GImage } from '../ui/GImage';
import { GText } from '../ui/GText';

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
          width: theme.dimensions.offerCard.width,
          gap: theme.spacing.sm,
          minHeight: theme.dimensions.offerCard.minHeight,
        }}
      >
        {offer.imageUrl ? (
          <GImage
            uri={offer.imageUrl}
            width={theme.dimensions.offerCard.width - theme.spacing.md * 2}
            height={theme.dimensions.offerCard.imageHeight}
            borderRadius={theme.radius.md}
            accessibilityLabel={offer.title}
          />
        ) : (
          <View
            style={{
              height: theme.dimensions.offerCard.imageHeight,
              borderRadius: theme.radius.md,
              // backgroundColor: theme.colors.bg.surfaceMuted,
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
