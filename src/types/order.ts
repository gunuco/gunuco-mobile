import type { MoneyPaise } from './commerce';
import type { FulfilmentType } from './fulfilment';

/** Minimal confirmation payload. Full Orders domain is a later phase. */
export type OrderConfirmation = {
  orderNumber?: string;
  orderId?: string;
  totalPaise?: MoneyPaise;
  fulfilment?: FulfilmentType;
  locationLabel?: string;
  scheduleLabel?: string;
  paymentStatus?: string;
  message?: string | null;
};
