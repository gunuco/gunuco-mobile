import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { OrderRider } from '@/src/types/tracking';
import { GCard } from '../ui/GCard';
import { GImage } from '../ui/GImage';
import { GText } from '../ui/GText';
import { GButton } from '../ui/GButton';
import { RatingView } from '../business/RatingView';

export type RiderInfoProps = {
  rider: OrderRider;
  onChat?: () => void;
  onCall?: () => void;
  callLoading?: boolean;
};

export function RiderInfo({ rider, onChat, onCall, callLoading }: RiderInfoProps) {
  const theme = useTheme();

  return (
    <GCard style={{ gap: theme.spacing.md }}>
      <View style={{ flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' }}>
        <GImage
          uri={rider.photoUrl}
          width={theme.dimensions.avatar.md}
          height={theme.dimensions.avatar.md}
          borderRadius={theme.dimensions.avatar.md / 2}
          accessibilityLabel={rider.displayName ? `${rider.displayName} photo` : 'Rider photo'}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <GText variant="label">{rider.displayName ?? 'Your rider'}</GText>
          {typeof rider.rating === 'number' ? (
            <RatingView mode="display" value={rider.rating} size="sm" />
          ) : null}
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        {onChat ? (
          <GButton
            title="Chat with Rider"
            variant="secondary"
            fullWidth
            onPress={onChat}
            accessibilityLabel="Chat with Rider"
            style={{ flex: 1 }}
          />
        ) : null}
        {onCall ? (
          <GButton
            title="Call Rider"
            fullWidth
            loading={callLoading}
            onPress={onCall}
            accessibilityLabel="Call Rider"
            style={{ flex: 1 }}
          />
        ) : null}
      </View>
    </GCard>
  );
}
