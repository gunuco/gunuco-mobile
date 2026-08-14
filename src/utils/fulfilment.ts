import type {
  FulfilmentSlot,
  FulfilmentSlotsResponse,
  FulfilmentType,
  PickupInfo,
  ServiceabilityResult,
} from '@/src/types/fulfilment';

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
  return asRecord(root.data) ?? root;
}

export function normalizeFulfilmentType(value: unknown): FulfilmentType {
  const raw = asString(value)?.toUpperCase();
  return raw === 'PICKUP' ? 'PICKUP' : 'DELIVERY';
}

export function normalizeServiceability(response: unknown): ServiceabilityResult {
  const payload = unwrap(response);
  const nested = asRecord(payload.serviceability) ?? payload;
  return {
    serviceable: asBoolean(nested.serviceable) ?? asBoolean(nested.isServiceable) ?? false,
    feePaise:
      asNumber(nested.feePaise) ?? asNumber(nested.fee) ?? asNumber(nested.deliveryFeePaise),
    message: asString(nested.message) ?? asString(nested.reason) ?? null,
  };
}

function normalizeSlot(raw: unknown): FulfilmentSlot | null {
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }
  const id = asString(rec.id) ?? asString(rec.slotId);
  const label =
    asString(rec.label) ??
    asString(rec.display) ??
    asString(rec.window) ??
    [asString(rec.startAt), asString(rec.endAt)].filter(Boolean).join(' – ');
  if (!id || !label) {
    return null;
  }
  return {
    id,
    label,
    startAt: asString(rec.startAt) ?? asString(rec.start) ?? null,
    endAt: asString(rec.endAt) ?? asString(rec.end) ?? null,
    available: asBoolean(rec.available) ?? asBoolean(rec.isAvailable),
  };
}

export function normalizeSlots(
  response: unknown,
  fallback: { date: string; fulfilmentType: FulfilmentType },
): FulfilmentSlotsResponse {
  const payload = unwrap(response);
  const nested =
    asRecord(payload.slots) && !Array.isArray(payload.slots) ? asRecord(payload.slots) : payload;
  const source = nested ?? payload;
  const rawSlots = Array.isArray(source.slots)
    ? source.slots
    : Array.isArray(payload.slots)
      ? payload.slots
      : [];
  const slots = rawSlots.map(normalizeSlot).filter((item): item is FulfilmentSlot => item !== null);
  const datesRaw = source.availableDates ?? payload.availableDates ?? source.dates;
  const availableDates = Array.isArray(datesRaw)
    ? datesRaw.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : undefined;

  return {
    date: asString(source.date) ?? fallback.date,
    fulfilmentType: normalizeFulfilmentType(
      source.fulfilmentType ?? source.fulfilment ?? fallback.fulfilmentType,
    ),
    asapAvailable:
      asBoolean(source.asapAvailable) ??
      asBoolean(source.asap) ??
      asBoolean(payload.asapAvailable) ??
      false,
    slots,
    availableDates,
    cutoffMessage:
      asString(source.cutoffMessage) ??
      asString(payload.cutoffMessage) ??
      asString(source.sameDayMessage) ??
      null,
    message: asString(source.message) ?? asString(payload.message) ?? null,
  };
}

export function normalizePickupInfo(response: unknown): PickupInfo {
  const payload = unwrap(response);
  const nested = asRecord(payload.pickup) ?? asRecord(payload.pickupInfo) ?? payload;
  return {
    name: asString(nested.name) ?? asString(nested.title) ?? asString(nested.locationName) ?? null,
    address: asString(nested.address) ?? asString(nested.addressText) ?? null,
    instructions: asString(nested.instructions) ?? asString(nested.notes) ?? null,
    hours: asString(nested.hours) ?? asString(nested.openingHours) ?? null,
    phone: asString(nested.phone) ?? asString(nested.contactPhone) ?? null,
    lat: asNumber(nested.lat) ?? asNumber(nested.latitude),
    lng: asNumber(nested.lng) ?? asNumber(nested.longitude),
  };
}

export function todayDateParam(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
