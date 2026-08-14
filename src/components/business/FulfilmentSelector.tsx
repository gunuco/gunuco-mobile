import React from 'react';
import type { FulfilmentType } from '@/src/types/fulfilment';
import { GSegmentedControl } from '../ui/GSegmentedControl';

export type FulfilmentSelectorProps = {
  value: FulfilmentType;
  onChange: (next: FulfilmentType) => void;
  disabled?: boolean;
};

export function FulfilmentSelector({ value, onChange, disabled }: FulfilmentSelectorProps) {
  return (
    <GSegmentedControl
      accessibilityLabel="Fulfilment type"
      value={value}
      disabled={disabled}
      onChange={onChange}
      options={[
        { value: 'DELIVERY', label: 'Delivery' },
        { value: 'PICKUP', label: 'Pickup' },
      ]}
    />
  );
}
