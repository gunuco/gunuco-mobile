import { useTheme } from '@/src/providers';
import type { HomeBanner } from '@/src/types';
import { FlashList } from '@shopify/flash-list';
import { memo } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { GImage } from '../ui/GImage';
import { GText } from '../ui/GText';
import { Skeleton } from '../ui/Skeleton';

export type HomeBannerCarouselProps = {
  banners: HomeBanner[];
  loading?: boolean;
  onBannerPress?: (banner: HomeBanner) => void;
};

function HomeBannerCarouselComponent({ banners, loading, onBannerPress }: HomeBannerCarouselProps) {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const bannerWidth = Math.round(screenWidth * 0.72);
  const bannerHeight = Math.round(bannerWidth * 1.5);

  if (loading) {
    return (
      <View style={{ paddingHorizontal: theme.spacing.lg }}>
        <Skeleton width={bannerWidth} height={bannerHeight} borderRadius={theme.radius.xl} />
      </View>
    );
  }

  if (!banners.length) {
    return null;
  }

  return (
    <View style={{ height: bannerHeight }}>
      <FlashList
        data={banners}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
        ItemSeparatorComponent={() => <View style={{ width: theme.spacing.md }} />}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.title ?? 'Promotional banner'}
            onPress={() => onBannerPress?.(item)}
            style={{ width: bannerWidth }}
          >
            <View
              style={{
                width: bannerWidth,
                height: bannerHeight,
                borderRadius: theme.radius.xl,
                overflow: 'hidden',
              }}
            >
              <GImage
                uri={item.imageUrl}
                width={bannerWidth}
                height={bannerHeight}
                borderRadius={theme.radius.xl}
                accessibilityLabel={item.title ?? 'Banner'}
              />
              {item.title ? (
                <View
                  style={{
                    position: 'absolute',
                    left: theme.spacing.md,
                    bottom: theme.spacing.md,
                    right: theme.spacing.md,
                  }}
                >
                  <GText variant="titleSm" color="inverse" numberOfLines={2}>
                    {item.title}
                  </GText>
                </View>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

export const HomeBannerCarousel = memo(HomeBannerCarouselComponent);
