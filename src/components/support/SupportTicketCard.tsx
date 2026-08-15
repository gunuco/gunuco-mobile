import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { SupportTicketSummary } from '@/src/types/support';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';

export type SupportTicketCardProps = {
  ticket: SupportTicketSummary;
  onPress: () => void;
};

function SupportTicketCardComponent({ ticket, onPress }: SupportTicketCardProps) {
  const theme = useTheme();
  const identifier = ticket.displayId ?? ticket.id;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Support ticket ${identifier}, ${ticket.statusLabel}`}
      accessibilityHint="Opens ticket conversation"
      onPress={onPress}
    >
      <GCard style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <GText variant="label" style={{ flex: 1 }} numberOfLines={1}>
            {identifier}
          </GText>
          <View
            accessibilityRole="text"
            accessibilityLabel={`Status ${ticket.statusLabel}`}
            style={{
              minHeight: theme.dimensions.chipMin,
              paddingHorizontal: theme.spacing.md,
              borderRadius: theme.radius.pill,
              borderWidth: 1,
              borderColor: theme.colors.border.default,
              backgroundColor: theme.colors.bg.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GText variant="caption">{ticket.statusLabel}</GText>
          </View>
        </View>
        {ticket.preview ? (
          <GText variant="bodyMd" color="secondary" numberOfLines={2}>
            {ticket.preview}
          </GText>
        ) : null}
        {ticket.orderId ? (
          <GText variant="caption" color="secondary">
            Order {ticket.orderId}
          </GText>
        ) : null}
        {ticket.updatedAtLabel ? (
          <GText variant="caption" color="secondary">
            Updated {ticket.updatedAtLabel}
          </GText>
        ) : null}
      </GCard>
    </Pressable>
  );
}

export const SupportTicketCard = memo(SupportTicketCardComponent);
