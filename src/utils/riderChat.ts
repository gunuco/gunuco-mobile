import type { RiderChatMessage, RiderChatSender, RiderChatThread } from '@/src/types/riderChat';

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
  return asRecord(root.data) ?? asRecord(root.thread) ?? root;
}

function toSender(value: unknown): RiderChatSender {
  const raw = asString(value)?.toUpperCase();
  if (raw === 'RIDER' || raw === 'DRIVER' || raw === 'DELIVERY') {
    return 'RIDER';
  }
  if (raw === 'SYSTEM' || raw === 'BOT') {
    return 'SYSTEM';
  }
  return 'CUSTOMER';
}

function formatTimestampLabel(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function normalizeRiderChatMessage(raw: unknown): RiderChatMessage | null {
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }
  const id = asString(rec.id) ?? asString(rec.messageId);
  const text = asString(rec.text) ?? asString(rec.body) ?? asString(rec.message);
  if (!id || !text) {
    return null;
  }
  const createdAt = asString(rec.createdAt) ?? asString(rec.sentAt) ?? asString(rec.timestamp);
  return {
    id,
    sender: toSender(rec.sender ?? rec.senderType ?? rec.from),
    text,
    createdAt,
    createdAtLabel: asString(rec.createdAtLabel) ?? formatTimestampLabel(createdAt),
    read: asBoolean(rec.read) ?? asBoolean(rec.isRead),
  };
}

function sortChronological(items: RiderChatMessage[]): RiderChatMessage[] {
  return [...items].sort((left, right) => {
    const leftTime = left.createdAt ? Date.parse(left.createdAt) : Number.NaN;
    const rightTime = right.createdAt ? Date.parse(right.createdAt) : Number.NaN;
    if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
      return 0;
    }
    return leftTime - rightTime;
  });
}

export function riderChatCacheKey(args: { orderId: string; page?: number }): { orderId: string } {
  return { orderId: args.orderId };
}

export function mergeRiderChatPages(
  current: RiderChatThread,
  incoming: RiderChatThread,
): RiderChatThread {
  if (incoming.page <= 1) {
    return incoming;
  }
  const seen = new Set(current.items.map((item) => item.id));
  const older = incoming.items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
  return {
    ...incoming,
    items: sortChronological([...older, ...current.items]),
  };
}

export function normalizeRiderChatThread(
  response: unknown,
  requestedPage?: number,
): RiderChatThread {
  const data = unwrap(response);
  const rawItems = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.messages)
      ? data.messages
      : [];
  const items: RiderChatMessage[] = [];
  for (const item of rawItems) {
    const normalized = normalizeRiderChatMessage(item);
    if (normalized) {
      items.push(normalized);
    }
  }
  const page =
    asNumber(data.page) ??
    (typeof requestedPage === 'number' && requestedPage > 0 ? requestedPage : 1);
  return {
    items: sortChronological(items),
    page,
    pageSize: asNumber(data.pageSize) ?? items.length,
    total: asNumber(data.total) ?? items.length,
    hasMore: asBoolean(data.hasMore) ?? false,
    available: asBoolean(data.available) ?? asBoolean(data.chatAvailable),
    message: asString(data.message) ?? null,
  };
}
