import type {
  CreateSupportTicketResult,
  SupportActor,
  SupportMessage,
  SupportTicketDetail,
  SupportTicketListResponse,
  SupportTicketStatus,
  SupportTicketSummary,
} from '@/src/types/support';

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
  return (
    asRecord(root.data) ??
    asRecord(root.ticket) ??
    asRecord(root.tickets) ??
    asRecord(root.result) ??
    root
  );
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

export function normalizeTicketStatus(value: unknown): SupportTicketStatus {
  const raw = asString(value)
    ?.toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (raw === 'NEW' || raw === 'OPEN' || raw === 'PENDING' || raw === 'CLOSED') {
    return raw;
  }
  return 'UNKNOWN';
}

export function ticketStatusLabel(status: SupportTicketStatus, fallback?: string): string {
  switch (status) {
    case 'NEW':
      return 'New';
    case 'OPEN':
      return 'Open';
    case 'PENDING':
      return 'Pending';
    case 'CLOSED':
      return 'Closed';
    default:
      return fallback?.trim() ? fallback : 'Update';
  }
}

function normalizeActor(value: unknown): SupportActor {
  const raw = asString(value)?.toLowerCase();
  if (
    raw === 'support' ||
    raw === 'agent' ||
    raw === 'admin' ||
    raw === 'staff' ||
    raw === 'system'
  ) {
    return 'support';
  }
  return 'customer';
}

export function normalizeSupportMessage(raw: unknown, index: number): SupportMessage | null {
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }
  const body = asString(rec.body) ?? asString(rec.message) ?? asString(rec.text);
  if (!body) {
    return null;
  }
  const createdAt = asString(rec.createdAt) ?? asString(rec.created_at);
  return {
    id: readId(rec, 'id', 'messageId') ?? `msg-${index}`,
    actor: normalizeActor(rec.actor ?? rec.senderType ?? rec.role ?? rec.from),
    body,
    createdAt,
    createdAtLabel: formatTimestampLabel(createdAt),
  };
}

export function normalizeTicketSummary(raw: unknown): SupportTicketSummary | null {
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }
  const id = readId(rec, 'id', 'ticketId');
  if (!id) {
    return null;
  }
  const status = normalizeTicketStatus(rec.status);
  const createdAt = asString(rec.createdAt) ?? asString(rec.created_at);
  const updatedAt = asString(rec.updatedAt) ?? asString(rec.updated_at) ?? createdAt;
  return {
    id,
    displayId: asString(rec.displayId) ?? asString(rec.number) ?? asString(rec.reference),
    status,
    statusLabel: ticketStatusLabel(status, asString(rec.statusLabel) ?? asString(rec.status)),
    preview:
      asString(rec.preview) ??
      asString(rec.subject) ??
      asString(rec.message) ??
      asString(rec.lastMessage),
    orderId: readId(rec, 'orderId', 'order_id'),
    createdAt,
    createdAtLabel: formatTimestampLabel(createdAt),
    updatedAt,
    updatedAtLabel: formatTimestampLabel(updatedAt),
  };
}

export function normalizeTicketDetail(response: unknown): SupportTicketDetail | null {
  const data = unwrap(response);
  const summary = normalizeTicketSummary(data);
  if (!summary) {
    return null;
  }
  const messageSource = Array.isArray(data.messages)
    ? data.messages
    : Array.isArray(data.thread)
      ? data.thread
      : [];
  const messages = messageSource
    .map((item, index) => normalizeSupportMessage(item, index))
    .filter((item): item is SupportMessage => Boolean(item));

  const replyFlag = asBoolean(data.replyAllowed) ?? asBoolean(data.canReply);
  const replyAllowed = replyFlag ?? summary.status !== 'CLOSED';

  return {
    ...summary,
    subject: asString(data.subject),
    replyAllowed,
    messages,
  };
}

export function normalizeTicketCreateResult(response: unknown): CreateSupportTicketResult {
  const data = unwrap(response);
  const ticketId = readId(data, 'id', 'ticketId');
  return {
    success: asBoolean(data.success) ?? Boolean(ticketId),
    ticketId,
    message: asString(data.message) ?? null,
  };
}

function readList(data: Record<string, unknown>): unknown[] {
  if (Array.isArray(data.items)) {
    return data.items;
  }
  if (Array.isArray(data.tickets)) {
    return data.tickets;
  }
  if (Array.isArray(data.results)) {
    return data.results;
  }
  return [];
}

export function normalizeTicketList(
  response: unknown,
  requestedPage?: number,
): SupportTicketListResponse {
  const data = unwrap(response);
  const items = readList(data)
    .map((item) => normalizeTicketSummary(item))
    .filter((item): item is SupportTicketSummary => Boolean(item));

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

export function mergeTicketListPages(
  current: SupportTicketListResponse | undefined,
  incoming: SupportTicketListResponse,
): SupportTicketListResponse {
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

export function ticketsListCacheKey(_args: { page?: number }): string {
  return 'LIST';
}
