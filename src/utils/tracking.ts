import type { GeoPoint, OrderRider, OrderTracking } from '@/src/types/tracking';

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
  return asRecord(root.data) ?? asRecord(root.tracking) ?? asRecord(root.rider) ?? root;
}

function toPoint(raw: unknown): GeoPoint | undefined {
  if (Array.isArray(raw) && raw.length >= 2) {
    const lat = asNumber(raw[0]);
    const lng = asNumber(raw[1]);
    if (typeof lat === 'number' && typeof lng === 'number') {
      return { lat, lng };
    }
  }
  const rec = asRecord(raw);
  if (!rec) {
    return undefined;
  }
  const lat = asNumber(rec.lat) ?? asNumber(rec.latitude);
  const lng = asNumber(rec.lng) ?? asNumber(rec.longitude);
  if (typeof lat === 'number' && typeof lng === 'number') {
    return { lat, lng };
  }
  return undefined;
}

function toPolyline(raw: unknown): GeoPoint[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined;
  }
  const points: GeoPoint[] = [];
  for (const item of raw) {
    const point = toPoint(item);
    if (point) {
      points.push(point);
    }
  }
  return points.length > 0 ? points : undefined;
}

export function normalizeOrderTracking(response: unknown): OrderTracking {
  const data = unwrap(response);
  const riderPoint =
    toPoint(data.rider) ??
    toPoint(asRecord(data.location)) ??
    toPoint({ lat: data.lat ?? data.riderLat, lng: data.lng ?? data.riderLng });
  const destination = toPoint(data.destination) ?? toPoint(data.dropoff) ?? toPoint(data.customer);
  const status = asString(data.status);
  const statusUpper = status?.toUpperCase() ?? '';
  return {
    available: asBoolean(data.available) ?? asBoolean(data.trackingAvailable) ?? true,
    status,
    statusLabel: asString(data.statusLabel),
    etaLabel: asString(data.etaLabel) ?? asString(data.eta) ?? asString(data.etaText) ?? null,
    riderLat: riderPoint?.lat,
    riderLng: riderPoint?.lng,
    destinationLat: destination?.lat,
    destinationLng: destination?.lng,
    polyline: toPolyline(data.polyline) ?? toPolyline(data.route) ?? toPolyline(data.path),
    updatedAt: asString(data.updatedAt) ?? asString(data.lastUpdatedAt) ?? asString(data.timestamp),
    stale: asBoolean(data.stale),
    delivered: asBoolean(data.delivered) ?? statusUpper === 'DELIVERED',
    cancelled:
      asBoolean(data.cancelled) ?? (statusUpper === 'CANCELLED' || statusUpper === 'CANCELED'),
    message: asString(data.message) ?? null,
  };
}

export function normalizeOrderRider(response: unknown): OrderRider {
  const data = unwrap(response);
  const nested = asRecord(data.rider) ?? data;
  return {
    displayName:
      asString(nested.displayName) ??
      asString(nested.name) ??
      asString(nested.riderName) ??
      undefined,
    photoUrl:
      asString(nested.photoUrl) ?? asString(nested.photo) ?? asString(nested.avatar) ?? null,
    rating: asNumber(nested.rating) ?? asNumber(nested.ratingAverage) ?? null,
    callAllowed:
      asBoolean(nested.callAllowed) ?? asBoolean(nested.canCall) ?? asBoolean(data.callAllowed),
    chatAllowed:
      asBoolean(nested.chatAllowed) ?? asBoolean(nested.canChat) ?? asBoolean(data.chatAllowed),
    callNumber:
      asString(nested.callNumber) ??
      asString(nested.phone) ??
      asString(nested.maskedPhone) ??
      asString(data.callNumber),
    message: asString(nested.message) ?? asString(data.message) ?? null,
  };
}
