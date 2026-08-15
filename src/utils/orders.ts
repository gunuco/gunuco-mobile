import type { CartChange, CartSelectedOption, CartTotals } from '@/src/types/cart';
import type { FulfilmentType } from '@/src/types/fulfilment';
import type {
  CancelOrderResult,
  CancellationEligibility,
  InvoiceResult,
  OrderDetail,
  OrderItem,
  OrderListItem,
  OrderListResponse,
  OrderPresentationStatus,
  OrderStatusGroup,
  OrderTimelineEvent,
  ReorderResult,
} from '@/src/types/order';
import { collectCartChangeMessages, mutationReturnedCart, normalizeCart } from '@/src/utils/cart';
import { normalizeFulfilmentType } from '@/src/utils/fulfilment';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function unwrap(response: unknown): Record<string, unknown> {
  const root = asRecord(response) ?? {};
  return (
    asRecord(root.data) ??
    asRecord(root.order) ??
    asRecord(root.orders) ??
    asRecord(root.result) ??
    root
  );
}

function titleCaseStatus(raw: string): string {
  return raw
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTimestampLabel(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function toPresentationStatus(value: unknown): OrderPresentationStatus {
  const raw = asString(value)
    ?.toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (!raw) {
    return 'UNKNOWN';
  }
  if (
    raw === 'CONFIRMED' ||
    raw === 'ORDER_CONFIRMED' ||
    raw === 'PLACED' ||
    raw === 'PAYMENT_CAPTURED'
  ) {
    return 'CONFIRMED';
  }
  if (raw === 'PREPARING' || raw === 'IN_PREPARATION' || raw === 'PREPARATION') {
    return 'PREPARING';
  }
  if (
    raw === 'READY' ||
    raw === 'READY_FOR_PICKUP' ||
    raw === 'READY_FOR_DISPATCH' ||
    raw === 'FULFILMENT' ||
    raw === 'FULFILLMENT'
  ) {
    return 'READY';
  }
  if (raw === 'OUT_FOR_DELIVERY' || raw === 'OFD' || raw === 'DISPATCHED' || raw === 'IN_TRANSIT') {
    return 'OUT_FOR_DELIVERY';
  }
  if (raw === 'DELIVERED' || raw === 'COMPLETED' || raw === 'COMPLETE') {
    return 'DELIVERED';
  }
  if (raw === 'CANCELLED' || raw === 'CANCELED') {
    return 'CANCELLED';
  }
  return 'UNKNOWN';
}

export function customerStatusLabel(
  presentation: OrderPresentationStatus,
  fallback?: string,
): string {
  switch (presentation) {
    case 'CONFIRMED':
      return 'Order Confirmed';
    case 'PREPARING':
      return 'Preparing';
    case 'READY':
      return 'Ready';
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return fallback ? titleCaseStatus(fallback) : 'Order update';
  }
}

export function toStatusGroup(value: unknown): OrderStatusGroup | undefined {
  const raw = asString(value)?.toLowerCase();
  if (raw === 'active' || raw === 'past' || raw === 'cancelled' || raw === 'canceled') {
    return raw === 'canceled' ? 'cancelled' : raw;
  }
  return undefined;
}

function fulfilmentLabel(type?: FulfilmentType): string | undefined {
  if (type === 'PICKUP') {
    return 'Pickup';
  }
  if (type === 'DELIVERY') {
    return 'Delivery';
  }
  return undefined;
}

function normalizeSelectedOption(raw: unknown): CartSelectedOption | null {
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }
  const valueLabelsRaw = rec.valueLabels ?? rec.labels ?? rec.valueLabel;
  const singleLabel = asString(valueLabelsRaw);
  const valueLabels = Array.isArray(valueLabelsRaw)
    ? valueLabelsRaw.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
      )
    : singleLabel
      ? [singleLabel]
      : undefined;
  return {
    groupId: asString(rec.groupId),
    groupLabel: asString(rec.groupLabel) ?? asString(rec.label) ?? asString(rec.name),
    valueLabels,
    summary: asString(rec.summary) ?? asString(rec.display) ?? asString(rec.text),
  };
}

export function formatOrderOptionSummary(item: {
  optionsSummary?: string;
  selectedOptions?: CartSelectedOption[];
}): string | undefined {
  if (item.optionsSummary?.trim()) {
    return item.optionsSummary.trim();
  }
  if (!item.selectedOptions?.length) {
    return undefined;
  }
  const parts: string[] = [];
  for (const option of item.selectedOptions) {
    const values = option.valueLabels?.filter(Boolean).join(', ');
    if (option.summary) {
      parts.push(option.summary);
    } else if (option.groupLabel && values) {
      parts.push(`${option.groupLabel}: ${values}`);
    } else if (values) {
      parts.push(values);
    }
  }
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

function normalizeOrderItem(raw: unknown): OrderItem | null {
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }
  const id = asString(rec.id) ?? asString(rec.orderItemId) ?? asString(rec.itemId);
  const name = asString(rec.name) ?? asString(rec.productName) ?? asString(rec.title);
  if (!id || !name) {
    return null;
  }
  const selectedRaw = rec.selectedOptions ?? rec.options ?? rec.optionValues;
  const selectedOptions = Array.isArray(selectedRaw)
    ? selectedRaw
        .map((item) => normalizeSelectedOption(item))
        .filter((item): item is CartSelectedOption => item != null)
    : undefined;
  const item: OrderItem = {
    id,
    productId: asString(rec.productId),
    name,
    imageUrl: asString(rec.imageUrl) ?? asString(rec.image) ?? asString(rec.thumbnail) ?? null,
    quantity: asNumber(rec.quantity) ?? 1,
    unitPricePaise:
      asNumber(rec.unitPricePaise) ?? asNumber(rec.pricePaise) ?? asNumber(rec.unitPrice),
    lineTotalPaise:
      asNumber(rec.lineTotalPaise) ?? asNumber(rec.totalPaise) ?? asNumber(rec.lineTotal),
    optionsSummary: asString(rec.optionsSummary) ?? asString(rec.optionSummary),
    selectedOptions,
    reviewEligible: asBoolean(rec.reviewEligible) ?? asBoolean(rec.canReview),
    reviewStatus: asString(rec.reviewStatus),
    canReorder: asBoolean(rec.canReorder),
  };
  if (!item.optionsSummary) {
    item.optionsSummary = formatOrderOptionSummary(item);
  }
  return item;
}

function normalizeTotals(raw: unknown): CartTotals {
  const rec = asRecord(raw) ?? {};
  return {
    subtotalPaise: asNumber(rec.subtotalPaise) ?? asNumber(rec.subtotal),
    discountPaise: asNumber(rec.discountPaise) ?? asNumber(rec.discount),
    storeCreditPaise: asNumber(rec.storeCreditPaise) ?? asNumber(rec.storeCredit),
    taxPaise: asNumber(rec.taxPaise) ?? asNumber(rec.tax) ?? asNumber(rec.gstPaise),
    deliveryFeePaise: asNumber(rec.deliveryFeePaise) ?? asNumber(rec.deliveryFee),
    totalPaise: asNumber(rec.totalPaise) ?? asNumber(rec.total) ?? asNumber(rec.grandTotalPaise),
  };
}

function normalizeTimelineEvent(
  raw: unknown,
  index: number,
  total: number,
): OrderTimelineEvent | null {
  if (typeof raw === 'string' && raw.trim()) {
    const presentationStatus = toPresentationStatus(raw);
    return {
      status: raw.trim(),
      statusLabel: customerStatusLabel(presentationStatus, raw),
      presentationStatus,
      current: index === total - 1,
    };
  }
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }
  const status = asString(rec.status) ?? asString(rec.code) ?? asString(rec.key);
  const presentationStatus = toPresentationStatus(status ?? rec.label);
  const at = asString(rec.at) ?? asString(rec.timestamp) ?? asString(rec.createdAt);
  return {
    status,
    statusLabel:
      asString(rec.label) ??
      asString(rec.statusLabel) ??
      customerStatusLabel(presentationStatus, status),
    presentationStatus,
    at,
    atLabel: asString(rec.atLabel) ?? asString(rec.timeLabel) ?? formatTimestampLabel(at),
    message: asString(rec.message) ?? asString(rec.description) ?? null,
    current: asBoolean(rec.current) ?? asBoolean(rec.isCurrent) ?? index === total - 1,
  };
}

export function ordersListCacheKey(args: { statusGroup: OrderStatusGroup; page?: number }): {
  statusGroup: OrderStatusGroup;
} {
  return { statusGroup: args.statusGroup };
}

export function mergeOrderListPages(
  current: OrderListResponse,
  incoming: OrderListResponse,
): OrderListResponse {
  if (incoming.page <= 1) {
    return incoming;
  }
  const seen = new Set(current.items.map((item) => item.id));
  const appended = incoming.items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
  return {
    ...incoming,
    items: [...current.items, ...appended],
  };
}

export function normalizeOrderListItem(raw: unknown): OrderListItem | null {
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }
  const id = asString(rec.id) ?? asString(rec.orderId);
  if (!id) {
    return null;
  }
  const status = asString(rec.status) ?? asString(rec.statusCode);
  const presentationStatus = toPresentationStatus(status ?? rec.statusLabel);
  const fulfilment = rec.fulfilment ? normalizeFulfilmentType(rec.fulfilment) : undefined;
  const placedAt = asString(rec.placedAt) ?? asString(rec.createdAt) ?? asString(rec.orderedAt);
  return {
    id,
    orderNumber: asString(rec.orderNumber) ?? asString(rec.number) ?? asString(rec.publicOrderId),
    status,
    statusLabel: asString(rec.statusLabel) ?? customerStatusLabel(presentationStatus, status),
    presentationStatus,
    statusGroup: toStatusGroup(rec.statusGroup),
    placedAt,
    placedAtLabel: asString(rec.placedAtLabel) ?? formatTimestampLabel(placedAt),
    fulfilment,
    fulfilmentLabel: asString(rec.fulfilmentLabel) ?? fulfilmentLabel(fulfilment),
    itemSummary: asString(rec.itemSummary) ?? asString(rec.summary) ?? asString(rec.productSummary),
    itemCount: asNumber(rec.itemCount) ?? asNumber(rec.itemsCount),
    totalPaise: asNumber(rec.totalPaise) ?? asNumber(rec.amountPaise) ?? asNumber(rec.total),
    scheduleLabel: asString(rec.scheduleLabel) ?? asString(rec.slotLabel),
    trackingAvailable: asBoolean(rec.trackingAvailable) ?? asBoolean(rec.canTrack),
    riderAvailable: asBoolean(rec.riderAvailable) ?? asBoolean(rec.hasRider),
    canReorder: asBoolean(rec.canReorder) ?? asBoolean(rec.reorderAvailable),
    canReview: asBoolean(rec.canReview) ?? asBoolean(rec.reviewEligible),
    invoiceAvailable: asBoolean(rec.invoiceAvailable) ?? asBoolean(rec.hasInvoice),
    refundPaise: asNumber(rec.refundPaise) ?? asNumber(rec.refundAmountPaise),
    refundStatus: asString(rec.refundStatus),
  };
}

export function normalizeOrderListResponse(
  response: unknown,
  requestedPage?: number,
): OrderListResponse {
  const root = asRecord(response) ?? {};
  const data = asRecord(root.data) ?? root;
  const rawItems = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.orders)
      ? data.orders
      : Array.isArray(root.items)
        ? root.items
        : [];
  const items: OrderListItem[] = [];
  for (const item of rawItems) {
    const normalized = normalizeOrderListItem(item);
    if (normalized) {
      items.push(normalized);
    }
  }
  const page =
    asNumber(data.page) ??
    asNumber(root.page) ??
    (typeof requestedPage === 'number' && requestedPage > 0 ? requestedPage : 1);
  const pageSize = asNumber(data.pageSize) ?? asNumber(root.pageSize) ?? items.length;
  const total = asNumber(data.total) ?? asNumber(root.total) ?? items.length;
  const hasMore =
    asBoolean(data.hasMore) ??
    asBoolean(root.hasMore) ??
    (typeof page === 'number' && typeof pageSize === 'number' && page * pageSize < total);
  return { items, page, pageSize, total, hasMore };
}

export function normalizeOrderDetail(response: unknown): OrderDetail | null {
  const data = unwrap(response);
  const id = asString(data.id) ?? asString(data.orderId);
  if (!id) {
    return null;
  }
  const status = asString(data.status) ?? asString(data.statusCode);
  const presentationStatus = toPresentationStatus(status ?? data.statusLabel);
  const fulfilment = data.fulfilment ? normalizeFulfilmentType(data.fulfilment) : undefined;
  const placedAt = asString(data.placedAt) ?? asString(data.createdAt);
  const itemsRaw = data.items ?? data.lines ?? data.orderItems;
  const items: OrderItem[] = [];
  if (Array.isArray(itemsRaw)) {
    for (const item of itemsRaw) {
      const normalized = normalizeOrderItem(item);
      if (normalized) {
        items.push(normalized);
      }
    }
  }
  const timelineRaw = data.timeline ?? data.history ?? data.statusHistory;
  const timelineSource = Array.isArray(timelineRaw) ? timelineRaw : [];
  const timeline: OrderTimelineEvent[] = [];
  timelineSource.forEach((event, index) => {
    const normalized = normalizeTimelineEvent(event, index, timelineSource.length);
    if (normalized) {
      timeline.push(normalized);
    }
  });
  const pickup = asRecord(data.pickup) ?? asRecord(data.pickupInfo);
  const totals = normalizeTotals(asRecord(data.totals) ?? asRecord(data.pricing) ?? data);
  if (totals.totalPaise == null) {
    totals.totalPaise = asNumber(data.totalPaise) ?? asNumber(data.amountPaise);
  }
  return {
    id,
    orderNumber: asString(data.orderNumber) ?? asString(data.number),
    status,
    statusLabel: asString(data.statusLabel) ?? customerStatusLabel(presentationStatus, status),
    presentationStatus,
    statusGroup: toStatusGroup(data.statusGroup),
    placedAt,
    placedAtLabel: asString(data.placedAtLabel) ?? formatTimestampLabel(placedAt),
    paymentStatus: asString(data.paymentStatus),
    paymentMethod: asString(data.paymentMethod) ?? asString(data.paymentMode),
    fulfilment,
    fulfilmentLabel: asString(data.fulfilmentLabel) ?? fulfilmentLabel(fulfilment),
    locationLabel:
      asString(data.locationLabel) ?? asString(data.addressSummary) ?? asString(data.pickupSummary),
    addressSummary: asString(data.addressSummary) ?? asString(data.deliveryAddress),
    pickupName: asString(pickup?.name) ?? asString(data.pickupName),
    pickupAddress: asString(pickup?.address) ?? asString(data.pickupAddress),
    pickupInstructions: asString(pickup?.instructions) ?? asString(data.pickupInstructions),
    scheduleLabel: asString(data.scheduleLabel) ?? asString(data.slotLabel),
    items,
    totals,
    timeline,
    trackingAvailable: asBoolean(data.trackingAvailable) ?? asBoolean(data.canTrack),
    riderAvailable: asBoolean(data.riderAvailable) ?? asBoolean(data.hasRider),
    chatAvailable: asBoolean(data.chatAvailable) ?? asBoolean(data.canChat),
    callAvailable: asBoolean(data.callAvailable) ?? asBoolean(data.canCall),
    canCancel: asBoolean(data.canCancel) ?? asBoolean(data.cancellationAllowed),
    canReorder: asBoolean(data.canReorder) ?? asBoolean(data.reorderAvailable),
    invoiceAvailable: asBoolean(data.invoiceAvailable) ?? asBoolean(data.hasInvoice),
    complaintAllowed:
      asBoolean(data.complaintAllowed) ??
      asBoolean(data.returnAllowed) ??
      asBoolean(data.canComplain),
    refundPaise: asNumber(data.refundPaise) ?? asNumber(data.refundAmountPaise),
    refundStatus: asString(data.refundStatus),
    message: asString(data.message) ?? null,
  };
}

export function normalizeCancellationEligibility(response: unknown): CancellationEligibility {
  const data = unwrap(response);
  const nested = asRecord(data.eligibility) ?? data;
  return {
    allowed: asBoolean(nested.allowed) ?? asBoolean(nested.canCancel) ?? false,
    refundPaise:
      asNumber(nested.refundPaise) ??
      asNumber(nested.refundAmountPaise) ??
      asNumber(nested.estimatedRefundPaise),
    message: asString(nested.message) ?? asString(nested.reason) ?? null,
    deadlineLabel: asString(nested.deadlineLabel) ?? asString(nested.deadline) ?? null,
    policyLabel: asString(nested.policyLabel) ?? asString(nested.policy) ?? null,
  };
}

export function normalizeCancelOrderResult(response: unknown): CancelOrderResult {
  const data = unwrap(response);
  const status = asString(data.status)?.toLowerCase();
  const successFlag = asBoolean(data.success) ?? asBoolean(data.cancelled);
  const successFromStatus = status === 'cancelled' || status === 'canceled' || status === 'success';
  return {
    success: successFlag ?? successFromStatus,
    refundPaise: asNumber(data.refundPaise) ?? asNumber(data.refundAmountPaise),
    refundStatus: asString(data.refundStatus),
    message: asString(data.message) ?? null,
  };
}

export function normalizeReorderResult(response: unknown): ReorderResult {
  const root = asRecord(response) ?? {};
  const data = asRecord(root.data) ?? root;
  const cart =
    mutationReturnedCart(response) ?? (asRecord(data.cart) ? normalizeCart(data.cart) : undefined);
  const changesRaw = data.changes ?? root.changes ?? cart?.changes;
  const changes: CartChange[] = [];
  if (Array.isArray(changesRaw)) {
    for (const item of changesRaw) {
      if (typeof item === 'string' && item.trim()) {
        changes.push({ message: item.trim() });
      } else {
        const rec = asRecord(item);
        if (rec) {
          changes.push({
            type: asString(rec.type),
            message: asString(rec.message) ?? asString(rec.text),
            productName: asString(rec.productName) ?? asString(rec.name),
            previousPricePaise: asNumber(rec.previousPricePaise),
            currentPricePaise: asNumber(rec.currentPricePaise),
          });
        }
      }
    }
  }
  if (changes.length === 0 && cart) {
    changes.push(...collectCartChangeMessages(cart));
  }
  const success = asBoolean(data.success) ?? Boolean(cart);
  return {
    success: success === true,
    cartUpdated: Boolean(cart) || success === true,
    changes,
    message: asString(data.message) ?? cart?.message ?? null,
  };
}

export function normalizeInvoiceResult(response: unknown): InvoiceResult {
  const data = unwrap(response);
  const invoice = asRecord(data.invoice) ?? data;
  const url =
    asString(invoice.url) ??
    asString(invoice.pdfUrl) ??
    asString(invoice.invoiceUrl) ??
    asString(data.url);
  const generating = asBoolean(invoice.generating) ?? asBoolean(data.generating);
  const available = asBoolean(invoice.available) ?? asBoolean(data.available) ?? Boolean(url);
  return {
    available: available && !generating,
    generating,
    url,
    message: asString(invoice.message) ?? asString(data.message) ?? null,
  };
}

export function minutesSince(iso?: string): number | undefined {
  if (!iso) {
    return undefined;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
}
