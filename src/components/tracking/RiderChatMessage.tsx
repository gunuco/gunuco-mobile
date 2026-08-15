import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { RiderChatMessage as RiderChatMessageType } from '@/src/types/riderChat';
import { GText } from '../ui/GText';

export type RiderChatMessageProps = {
  message: RiderChatMessageType;
};

export function RiderChatMessage({ message }: RiderChatMessageProps) {
  const theme = useTheme();
  const mine = message.sender === 'CUSTOMER';
  const system = message.sender === 'SYSTEM';

  return (
    <View
      accessibilityLabel={`${mine ? 'You' : message.sender === 'RIDER' ? 'Rider' : 'Update'}: ${message.text}`}
      style={{
        alignSelf: system ? 'center' : mine ? 'flex-end' : 'flex-start',
        maxWidth: '82%',
        padding: theme.spacing.sm,
        borderRadius: theme.radius.lg,
        backgroundColor: system
          ? theme.colors.bg.surfaceMuted
          : mine
            ? theme.colors.brand.primary
            : theme.colors.bg.surfaceMuted,
      }}
    >
      <GText variant="bodyMd" color={mine && !system ? 'inverse' : 'primary'}>
        {message.text}
      </GText>
      {message.createdAtLabel ? (
        <GText variant="caption" color={mine && !system ? 'inverse' : 'secondary'}>
          {message.createdAtLabel}
        </GText>
      ) : null}
    </View>
  );
}
