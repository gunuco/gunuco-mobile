import React from 'react';
import { useTheme } from '@/src/providers';
import type { PickupInfo } from '@/src/types/fulfilment';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';

export type PickupInfoPanelProps = {
  info: PickupInfo;
};

export function PickupInfoPanel({ info }: PickupInfoPanelProps) {
  const theme = useTheme();
  const rows = [info.name, info.address, info.hours, info.phone, info.instructions].filter(
    (value): value is string => Boolean(value),
  );

  return (
    <GCard style={{ gap: theme.spacing.sm }}>
      <GText variant="titleSm">Pickup</GText>
      {rows.length === 0 ? (
        <GText variant="bodySm" color="secondary">
          Pickup details will appear here when the backend assigns them.
        </GText>
      ) : (
        rows.map((row) => (
          <GText key={row} variant="bodyMd" color="secondary">
            {row}
          </GText>
        ))
      )}
    </GCard>
  );
}
