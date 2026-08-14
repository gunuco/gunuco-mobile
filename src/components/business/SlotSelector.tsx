import React from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { FulfilmentSlot } from '@/src/types/fulfilment';
import { GChip } from '../ui/GChip';
import { GText } from '../ui/GText';
import { GCard } from '../ui/GCard';
import { GSegmentedControl } from '../ui/GSegmentedControl';
import { GLoader } from '../ui/GLoader';
import { ErrorState } from '../ui/ErrorState';

export type ScheduleMode = 'ASAP' | 'SCHEDULE';

export type SlotSelectorProps = {
  mode: ScheduleMode;
  onModeChange: (next: ScheduleMode) => void;
  asapAvailable: boolean;
  dates: string[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  slots: FulfilmentSlot[];
  selectedSlotId?: string | null;
  onSlotChange: (slotId: string) => void;
  loading?: boolean;
  errorMessage?: string | null;
  cutoffMessage?: string | null;
  onRetry?: () => void;
};

export function SlotSelector({
  mode,
  onModeChange,
  asapAvailable,
  dates,
  selectedDate,
  onDateChange,
  slots,
  selectedSlotId,
  onSlotChange,
  loading = false,
  errorMessage,
  cutoffMessage,
  onRetry,
}: SlotSelectorProps) {
  const theme = useTheme();
  const scheduleOptions: { value: ScheduleMode; label: string }[] = asapAvailable
    ? [
        { value: 'ASAP', label: 'ASAP' },
        { value: 'SCHEDULE', label: 'Schedule' },
      ]
    : [{ value: 'SCHEDULE', label: 'Schedule' }];

  return (
    <GCard style={{ gap: theme.spacing.md }}>
      <GText variant="titleSm">When</GText>
      <GSegmentedControl
        accessibilityLabel="ASAP or schedule"
        value={asapAvailable ? mode : 'SCHEDULE'}
        onChange={onModeChange}
        options={scheduleOptions}
      />
      {mode === 'ASAP' && asapAvailable ? (
        <GText variant="bodySm" color="secondary">
          We will prepare this as soon as possible, according to backend availability.
        </GText>
      ) : (
        <>
          {cutoffMessage ? (
            <GText variant="bodySm" color="danger">
              {cutoffMessage}
            </GText>
          ) : null}
          {dates.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                {dates.map((date) => (
                  <GChip
                    key={date}
                    label={date}
                    selected={date === selectedDate}
                    onPress={() => onDateChange(date)}
                    accessibilityLabel={`Date ${date}`}
                  />
                ))}
              </View>
            </ScrollView>
          ) : (
            <GText variant="caption" color="secondary">
              Choose a date returned by the backend, or retry if none are listed.
            </GText>
          )}
          {loading ? (
            <GLoader />
          ) : errorMessage ? (
            <ErrorState message={errorMessage} onRetry={onRetry} />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              {slots.map((slot) => (
                <GChip
                  key={slot.id}
                  label={slot.label}
                  selected={slot.id === selectedSlotId}
                  disabled={slot.available === false}
                  onPress={() => onSlotChange(slot.id)}
                  accessibilityLabel={`Slot ${slot.label}`}
                />
              ))}
              {!loading && slots.length === 0 ? (
                <GText variant="bodySm" color="secondary">
                  No slots are available for this date.
                </GText>
              ) : null}
            </View>
          )}
        </>
      )}
    </GCard>
  );
}
