import React, { useState } from 'react';
import { PanResponder, View } from 'react-native';
import { useTheme } from '@/src/providers';
import { formatPaise } from '@/src/utils/money';
import { GText } from './GText';

export type PriceRangeSliderProps = {
  minPaise: number;
  maxPaise: number;
  lowPaise: number;
  highPaise: number;
  onChange: (lowPaise: number, highPaise: number) => void;
};

const THUMB = 22;
const TRACK = 4;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundPaise(value: number): number {
  return Math.round(value / 100) * 100;
}

export function PriceRangeSlider({
  minPaise,
  maxPaise,
  lowPaise,
  highPaise,
  onChange,
}: PriceRangeSliderProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(1);
  const span = Math.max(1, maxPaise - minPaise);
  const trackWidth = Math.max(width, 1);

  const lowRatio = clamp((lowPaise - minPaise) / span, 0, 1);
  const highRatio = clamp((highPaise - minPaise) / span, 0, 1);

  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const ratio = clamp(event.nativeEvent.locationX / trackWidth, 0, 1);
      const next = roundPaise(minPaise + ratio * span);
      const distLow = Math.abs(next - lowPaise);
      const distHigh = Math.abs(next - highPaise);
      if (distLow <= distHigh) {
        onChange(Math.min(next, highPaise), highPaise);
      } else {
        onChange(lowPaise, Math.max(next, lowPaise));
      }
    },
    onPanResponderMove: (event) => {
      const ratio = clamp(event.nativeEvent.locationX / trackWidth, 0, 1);
      const next = roundPaise(minPaise + ratio * span);
      const mid = (lowPaise + highPaise) / 2;
      if (next <= mid) {
        onChange(Math.min(next, highPaise), highPaise);
      } else {
        onChange(lowPaise, Math.max(next, lowPaise));
      }
    },
  });

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <GText variant="label">
        {formatPaise(lowPaise)} – {formatPaise(highPaise)}
      </GText>
      <View
        {...responder.panHandlers}
        onLayout={(event) => {
          setWidth(event.nativeEvent.layout.width);
        }}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Price range"
        accessibilityValue={{
          min: minPaise,
          max: maxPaise,
          now: highPaise - lowPaise,
        }}
        style={{
          height: theme.dimensions.touchMin,
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            height: TRACK,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.border.default,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: lowRatio * width,
            top: (theme.dimensions.touchMin - TRACK) / 2,
            width: Math.max(TRACK, (highRatio - lowRatio) * width),
            height: TRACK,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.brand.primary,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: lowRatio * width - THUMB / 2,
            top: (theme.dimensions.touchMin - THUMB) / 2,
            width: THUMB,
            height: THUMB,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.bg.surface,
            borderWidth: 2,
            borderColor: theme.colors.brand.primary,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: highRatio * width - THUMB / 2,
            top: (theme.dimensions.touchMin - THUMB) / 2,
            width: THUMB,
            height: THUMB,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.bg.surface,
            borderWidth: 2,
            borderColor: theme.colors.brand.primary,
          }}
        />
      </View>
    </View>
  );
}
