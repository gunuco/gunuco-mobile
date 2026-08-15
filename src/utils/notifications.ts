import type {
  CustomerNotification,
  NotificationDeepLink,
  NotificationListArgs,
  NotificationListResponse,
} from '@/src/types/notification';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function unwrap(response: unknown): Record<string, unknown> {
  const root = asRecord(response) ?? {};
  return asRecord(root.data) ?? asRecord(root.notifications) ?? root;
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

function readId(rec: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = rec[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return undefined;
}

const TRACKING_TYPES = new Set(['OUT_FOR_DELIVERY', 'RIDER_NEARBY', 'TRACKING', 'LIVE_TRACKING']);

const TICKET_TYPES = new Set(['SUPPORT', 'SUPPORT_UPDATE', 'TICKET', 'TICKET_UPDATE']);

const REVIEW_TYPES = new Set(['REVIEW', 'REVIEW_REMINDER']);

function typeLabel(type?: string): string | undefined {
  if (!type) {
    return undefined;
  }
  switch (type) {
    case 'ORDER_CONFIRMED':
      return 'Order confirmed';
    case 'PAYMENT_SUCCESS':
      return 'Payment';
    case 'ORDER_PREPARING':
      return 'Preparing';
    case 'ORDER_READY':
      return 'Ready';
    case 'OUT_FOR_DELIVERY':
      return 'Out for delivery';
    case 'RIDER_NEARBY':
      return 'Rider nearby';
    case 'DELIVERED':
      return 'Delivered';
    case 'SUPPORT_UPDATE':
    case 'SUPPORT':
      return 'Support';
    case 'REVIEW_REMINDER':
      return 'Review';
    default:
      return undefined;
  }
}

function normalizeType(value: unknown): string | undefined {
  const raw = asString(value)
    ?.toUpperCase()
    .replace(/[\s-]+/g, '_');
  return raw;
}

export function parseNotificationDeepLink(
  rec: Record<string, unknown>,
  type?: string,
): NotificationDeepLink | undefined {
  const nested = asRecord(rec.data) ?? asRecord(rec.payload) ?? asRecord(rec.deepLink) ?? rec;
  const orderId = readId(nested, 'orderId', 'order_id') ?? readId(rec, 'orderId', 'order_id');
  const ticketId = readId(nested, 'ticketId', 'ticket_id') ?? readId(rec, 'ticketId', 'ticket_id');
  const orderItemId =
    readId(nested, 'orderItemId', 'order_item_id') ?? readId(rec, 'orderItemId', 'order_item_id');
  const productId =
    readId(nested, 'productId', 'product_id') ?? readId(rec, 'productId', 'product_id');
  const destination =
    asString(nested.destination) ??
    asString(nested.screen) ??
    asString(nested.linkType) ??
    asString(rec.destination);

  if (ticketId || TICKET_TYPES.has(type ?? '') || destination === 'ticket') {
    return ticketId ? { kind: 'ticket', ticketId } : undefined;
  }
  if (orderItemId || REVIEW_TYPES.has(type ?? '') || destination === 'review') {
    return orderItemId ? { kind: 'review', orderItemId, productId } : undefined;
  }
  if (TRACKING_TYPES.has(type ?? '') || destination === 'tracking') {
    return orderId ? { kind: 'tracking', orderId } : undefined;
  }
  if (orderId) {
    return { kind: 'order', orderId };
  }
  return undefined;
}

export function normalizeNotification(raw: unknown): CustomerNotification | null {
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }
  const id = readId(rec, 'id', 'notificationId');
  const title = asString(rec.title);
  const body = asString(rec.body) ?? asString(rec.message) ?? '';
  if (!id || !title) {
    return null;
  }
  const type = normalizeType(rec.type ?? rec.notificationType ?? rec.event);
  const createdAt = asString(rec.createdAt) ?? asString(rec.created_at);
  return {
    id,
    title,
    body,
    createdAt,
    createdAtLabel: formatTimestampLabel(createdAt),
    read: asBoolean(rec.read) ?? asBoolean(rec.isRead) ?? false,
    type,
    typeLabel: typeLabel(type),
    deepLink: parseNotificationDeepLink(rec, type),
  };
}

function readList(data: Record<string, unknown>): unknown[] {
  if (Array.isArray(data.items)) {
    return data.items;
  }
  if (Array.isArray(data.notifications)) {
    return data.notifications;
  }
  if (Array.isArray(data.results)) {
    return data.results;
  }
  return [];
}

export function normalizeNotificationList(
  response: unknown,
  requestedPage?: number,
): NotificationListResponse {
  const data = unwrap(response);
  const items = readList(data)
    .map((item) => normalizeNotification(item))
    .filter((item): item is CustomerNotification => Boolean(item));

  const seen = new Set<string>();
  const deduped = items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });

  const page =
    asNumber(data.page) ??
    (typeof requestedPage === 'number' && requestedPage > 0 ? requestedPage : 1);
  const pageSize = asNumber(data.pageSize) ?? asNumber(data.limit) ?? deduped.length;
  const total = asNumber(data.total) ?? deduped.length;
  const hasMore = asBoolean(data.hasMore) ?? (pageSize > 0 ? page * pageSize < total : false);

  return { items: deduped, page, pageSize, total, hasMore };
}

export function mergeNotificationListPages(
  current: NotificationListResponse | undefined,
  incoming: NotificationListResponse,
): NotificationListResponse {
  if (incoming.page <= 1) {
    return incoming;
  }
  const seen = new Set((current?.items ?? []).map((item) => item.id));
  const appended = incoming.items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
  return {
    ...incoming,
    items: [...(current?.items ?? []), ...appended],
  };
}

export function notificationsListCacheKey(_args: NotificationListArgs): string {
  return 'LIST';
}

export function parsePushData(data: unknown): NotificationDeepLink | undefined {
  const rec = asRecord(data);
  if (!rec) {
    return undefined;
  }
  const type = normalizeType(rec.type ?? rec.notificationType ?? rec.event);
  return parseNotificationDeepLink(rec, type);
}
