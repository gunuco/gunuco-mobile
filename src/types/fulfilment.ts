import type { MoneyPaise } from './commerce';

export type FulfilmentType = 'DELIVERY' | 'PICKUP';

export type ServiceabilityResult = {
  serviceable: boolean;
  feePaise?: MoneyPaise;
  message?: string | null;
};

export type FulfilmentSlot = {
  id: string;
  label: string;
  startAt?: string | null;
  endAt?: string | null;
  available?: boolean;
};

export type FulfilmentSlotsResponse = {
  date: string;
  fulfilmentType: FulfilmentType;
  asapAvailable: boolean;
  slots: FulfilmentSlot[];
  availableDates?: string[];
  cutoffMessage?: string | null;
  message?: string | null;
};

export type PickupInfo = {
  name?: string | null;
  address?: string | null;
  instructions?: string | null;
  hours?: string | null;
  phone?: string | null;
  lat?: number;
  lng?: number;
};
