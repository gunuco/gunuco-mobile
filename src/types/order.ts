import type { MoneyPaise } from './commerce';
import type { CartChange, CartSelectedOption, CartTotals } from './cart';
import type { FulfilmentType } from './fulfilment';

/** Minimal confirmation payload from Phase 9. */
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

/** Query contract: GET /orders?statusGroup= [CONFIRM] page vs cursor. */
export type OrderStatusGroup = 'active' | 'past' | 'cancelled';

/**
 * Customer-facing presentation status. Unknown backend codes stay UNKNOWN
 * and display the backend label when provided.
 */
export type OrderPresentationStatus =
  'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'UNKNOWN';

export type OrderListArgs = {
  statusGroup: OrderStatusGroup;
  page?: number;
};

export type OrderListItem = {
  id: string;
  orderNumber?: string;
  status?: string;
  statusLabel: string;
  presentationStatus: OrderPresentationStatus;
  statusGroup?: OrderStatusGroup;
  placedAt?: string;
  placedAtLabel?: string;
  fulfilment?: FulfilmentType;
  fulfilmentLabel?: string;
  itemSummary?: string;
  itemCount?: number;
  totalPaise?: MoneyPaise;
  scheduleLabel?: string;
  trackingAvailable?: boolean;
  riderAvailable?: boolean;
  canReorder?: boolean;
  canReview?: boolean;
  invoiceAvailable?: boolean;
  refundPaise?: MoneyPaise;
  refundStatus?: string;
};

export type OrderListResponse = {
  items: OrderListItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

export type OrderItem = {
  id: string;
  productId?: string;
  name: string;
  imageUrl?: string | null;
  quantity: number;
  unitPricePaise?: MoneyPaise;
  lineTotalPaise?: MoneyPaise;
  optionsSummary?: string;
  selectedOptions?: CartSelectedOption[];
  reviewEligible?: boolean;
  reviewStatus?: string;
  canReorder?: boolean;
};

export type OrderTimelineEvent = {
  status?: string;
  statusLabel: string;
  presentationStatus: OrderPresentationStatus;
  at?: string;
  atLabel?: string;
  message?: string | null;
  current?: boolean;
};

export type CancellationEligibility = {
  allowed: boolean;
  refundPaise?: MoneyPaise;
  message?: string | null;
  deadlineLabel?: string | null;
  policyLabel?: string | null;
};

export type OrderDetail = {
  id: string;
  orderNumber?: string;
  status?: string;
  statusLabel: string;
  presentationStatus: OrderPresentationStatus;
  statusGroup?: OrderStatusGroup;
  placedAt?: string;
  placedAtLabel?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  fulfilment?: FulfilmentType;
  fulfilmentLabel?: string;
  locationLabel?: string;
  addressSummary?: string;
  pickupName?: string;
  pickupAddress?: string;
  pickupInstructions?: string;
  scheduleLabel?: string;
  items: OrderItem[];
  totals: CartTotals;
  timeline: OrderTimelineEvent[];
  trackingAvailable?: boolean;
  riderAvailable?: boolean;
  chatAvailable?: boolean;
  callAvailable?: boolean;
  canCancel?: boolean;
  canReorder?: boolean;
  invoiceAvailable?: boolean;
  complaintAllowed?: boolean;
  refundPaise?: MoneyPaise;
  refundStatus?: string;
  message?: string | null;
};

export type CancelOrderPayload = {
  orderId: string;
  reasonCode: string;
  otherText?: string;
  idempotencyKey: string;
};

export type CancelOrderResult = {
  success: boolean;
  refundPaise?: MoneyPaise;
  refundStatus?: string;
  message?: string | null;
};

export type ReorderPayload = {
  orderId: string;
  idempotencyKey: string;
};

export type ReorderResult = {
  success: boolean;
  cartUpdated: boolean;
  changes: CartChange[];
  message?: string | null;
};

export type InvoiceResult = {
  available: boolean;
  generating?: boolean;
  url?: string;
  message?: string | null;
};

export type CancellationReason = {
  code: string;
  label: string;
};

/**
 * GUNUCO Q37 predefined reasons. Exact backend codes remain [CONFIRM].
 */
export const CANCELLATION_REASONS: readonly CancellationReason[] = [
  { code: 'ORDERED_BY_MISTAKE', label: 'Ordered by mistake' },
  { code: 'CHANGED_MIND', label: 'Changed my mind' },
  { code: 'DELIVERY_TAKING_TOO_LONG', label: 'Delivery taking too long' },
  { code: 'OTHER', label: 'Other' },
] as const;
