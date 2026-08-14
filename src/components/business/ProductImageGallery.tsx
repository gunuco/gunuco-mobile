import React, { memo, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTheme } from '@/src/providers';
import type { ProductImage } from '@/src/types/product';
import { GImage } from '../ui/GImage';
import { GText } from '../ui/GText';
import { GModal } from '../ui/GModal';

export type ProductImageGalleryProps = {
  images: ProductImage[];
  productName: string;
};

function ProductImageGalleryComponent({ images, productName }: ProductImageGalleryProps) {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const height = theme.dimensions.productImage.hero;
  const count = images.length;
  const current = images[index] ?? images[0];

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / windowWidth);
    if (next >= 0 && next < count) {
      setIndex(next);
    }
  };

  if (!count) {
    return (
      <GImage
        uri={null}
        width={windowWidth}
        height={height}
        borderRadius={0}
        accessibilityLabel={`${productName} image unavailable`}
      />
    );
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        onMomentumScrollEnd={onScrollEnd}
        showsHorizontalScrollIndicator={false}
        accessibilityLabel={`${productName} images`}
      >
        {images.map((image, imageIndex) => {
          const label = image.alt?.trim() || `${productName} image ${imageIndex + 1} of ${count}`;
          return (
            <Pressable
              key={image.id ?? `${image.url}-${imageIndex}`}
              accessibilityRole="imagebutton"
              accessibilityLabel={label}
              accessibilityHint={count > 1 ? 'Opens a larger preview' : undefined}
              onPress={() => {
                setIndex(imageIndex);
                setPreviewVisible(true);
              }}
            >
              <GImage
                uri={image.url}
                width={windowWidth}
                height={height}
                borderRadius={0}
                recyclingKey={image.id ?? image.url}
                accessibilityLabel={label}
              />
            </Pressable>
          );
        })}
      </ScrollView>

      {count > 1 ? (
        <View
          style={{
            position: 'absolute',
            right: theme.spacing.md,
            bottom: theme.spacing.md,
            backgroundColor: theme.colors.overlay.scrim,
            borderRadius: theme.radius.pill,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
          }}
          accessible
          accessibilityLabel={`Image ${index + 1} of ${count}`}
        >
          <GText variant="caption" color="inverse">
            {index + 1} / {count}
          </GText>
        </View>
      ) : null}

      {count > 1 ? (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: theme.spacing.xs,
            marginTop: theme.spacing.sm,
          }}
        >
          {images.map((image, imageIndex) => (
            <View
              key={`dot-${image.id ?? image.url}-${imageIndex}`}
              style={{
                width: imageIndex === index ? theme.spacing.md : theme.spacing.xs,
                height: theme.spacing.xs,
                borderRadius: theme.radius.pill,
                backgroundColor:
                  imageIndex === index ? theme.colors.brand.primary : theme.colors.border.default,
              }}
            />
          ))}
        </View>
      ) : null}

      <GModal
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        title={count > 1 ? `${index + 1} / ${count}` : productName}
      >
        <GImage
          uri={current?.url}
          width={windowWidth - theme.spacing.lg * 4}
          height={windowWidth - theme.spacing.lg * 4}
          contentFit="contain"
          recyclingKey={current?.id ?? current?.url}
          accessibilityLabel={current?.alt?.trim() || productName}
        />
      </GModal>
    </View>
  );
}

export const ProductImageGallery = memo(ProductImageGalleryComponent);
