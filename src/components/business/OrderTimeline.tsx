import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { OrderTimelineEvent } from '@/src/types/order';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';
import { GIcon } from '../ui/GIcon';

export type OrderTimelineProps = {
  events: OrderTimelineEvent[];
};

export function OrderTimeline({ events }: OrderTimelineProps) {
  const theme = useTheme();
  if (events.length === 0) {
    return null;
  }
  const currentIndex = events.findIndex((item) => item.current);

  return (
    <GCard style={{ gap: theme.spacing.md }}>
      <GText variant="titleSm">Timeline</GText>
      {events.map((event, index) => {
        const current = event.current === true || (currentIndex < 0 && index === events.length - 1);
        const done = currentIndex >= 0 ? index < currentIndex : index < events.length - 1;
        return (
          <View
            key={`${event.status ?? event.statusLabel}-${index}`}
            style={{ flexDirection: 'row', gap: theme.spacing.md }}
            accessibilityLabel={`${event.statusLabel}${event.atLabel ? `, ${event.atLabel}` : ''}${current ? ', current' : ''}`}
          >
            <GIcon
              name={current ? 'radio-button-on' : done ? 'checkmark-circle' : 'ellipse-outline'}
              size="md"
              color={
                current
                  ? theme.colors.brand.primary
                  : done
                    ? theme.colors.semantic.success
                    : theme.colors.text.disabled
              }
            />
            <View style={{ flex: 1, gap: 2 }}>
              <GText variant={current ? 'label' : 'bodyMd'}>{event.statusLabel}</GText>
              {event.atLabel ? (
                <GText variant="caption" color="secondary">
                  {event.atLabel}
                </GText>
              ) : null}
              {event.message ? (
                <GText variant="caption" color="secondary">
                  {event.message}
                </GText>
              ) : null}
            </View>
          </View>
        );
      })}
    </GCard>
  );
}
