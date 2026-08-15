import React, { memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { SupportMessage as SupportThreadMessage } from '@/src/types/support';
import { GText } from '../ui/GText';

export type SupportMessageProps = {
  message: SupportThreadMessage;
};

function SupportMessageComponent({ message }: SupportMessageProps) {
  const theme = useTheme();
  const isCustomer = message.actor === 'customer';

  return (
    <View
      accessibilityLabel={`${isCustomer ? 'You' : 'Support'}: ${message.body}`}
      style={{
        alignItems: isCustomer ? 'flex-end' : 'flex-start',
        marginBottom: theme.spacing.sm,
      }}
    >
      <GText variant="caption" color="secondary">
        {isCustomer ? 'You' : 'Support'}
        {message.createdAtLabel ? ` · ${message.createdAtLabel}` : ''}
      </GText>
      <View
        style={{
          maxWidth: '85%',
          marginTop: theme.spacing.xs,
          padding: theme.spacing.sm,
          borderRadius: theme.radius.lg,
          backgroundColor: isCustomer ? theme.colors.brand.primary : theme.colors.bg.surfaceMuted,
        }}
      >
        <GText variant="bodyMd" color={isCustomer ? 'inverse' : 'primary'}>
          {message.body}
        </GText>
      </View>
    </View>
  );
}

export const SupportMessage = memo(SupportMessageComponent);
