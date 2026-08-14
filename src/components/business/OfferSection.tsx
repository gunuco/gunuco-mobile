import React, { memo } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '@/src/providers';
import type { HomeOffer } from '@/src/types';
import { Section } from '../layout/Section';
import { Skeleton } from '../ui/Skeleton';
import { OfferCard } from './OfferCard';

export type OfferSectionProps = {
  title?: string;
  offers: HomeOffer[];
  loading?: boolean;
  onOfferPress?: (offer: HomeOffer) => void;
  onSeeAllPress?: () => void;
};

function OfferSectionComponent({
  title = 'Offers for you',
  offers,
  loading,
  onOfferPress,
  onSeeAllPress,
}: OfferSectionProps) {
  const theme = useTheme();

  if (!loading && offers.length === 0) {
    return null;
  }

  return (
    <Section
      title={title}
      actionLabel={onSeeAllPress ? 'See all' : undefined}
      onActionPress={onSeeAllPress}
    >
      {loading ? (
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.md,
          }}
        >
          <Skeleton
            width={theme.dimensions.offerCard.width}
            height={theme.dimensions.offerCard.minHeight}
            borderRadius={theme.radius.lg}
          />
          <Skeleton
            width={theme.dimensions.offerCard.width}
            height={theme.dimensions.offerCard.minHeight}
            borderRadius={theme.radius.lg}
          />
        </View>
      ) : (
        <View style={{ height: theme.dimensions.catalogRowHeight }}>
          <FlashList
            data={offers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
            ItemSeparatorComponent={() => <View style={{ width: theme.spacing.md }} />}
            renderItem={({ item }) => (
              <OfferCard offer={item} onPress={() => onOfferPress?.(item)} />
            )}
          />
        </View>
      )}
    </Section>
  );
}

export const OfferSection = memo(OfferSectionComponent);
