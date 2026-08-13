import React, { useState } from 'react';
import { View, StyleSheet, type StyleProp, type ImageStyle, type ViewStyle } from 'react-native';
import { Image, type ImageContentFit } from 'expo-image';
import { useTheme } from '@/src/providers';
import { GIcon } from './GIcon';

export type GImageProps = {
  uri?: string | null;
  width?: number;
  height?: number;
  borderRadius?: number;
  contentFit?: ImageContentFit;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  recyclingKey?: string;
  accessibilityLabel?: string;
};

export function GImage({
  uri,
  width,
  height,
  borderRadius,
  contentFit = 'cover',
  style,
  containerStyle,
  recyclingKey,
  accessibilityLabel,
}: GImageProps) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const radius = borderRadius ?? theme.radius.lg;

  if (!uri || failed) {
    return (
      <View
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.fallback,
          {
            width,
            height,
            borderRadius: radius,
            backgroundColor: theme.colors.bg.surfaceMuted,
          },
          containerStyle,
        ]}
      >
        <GIcon name="image-outline" color={theme.colors.text.disabled} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[{ width, height, borderRadius: radius }, style]}
      contentFit={contentFit}
      cachePolicy="memory-disk"
      recyclingKey={recyclingKey}
      accessibilityLabel={accessibilityLabel}
      onError={() => setFailed(true)}
      transition={theme.animations.duration.fast}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
