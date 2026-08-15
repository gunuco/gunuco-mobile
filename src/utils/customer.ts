import type { Customer } from '@/src/types/auth';
import type { PhoneChangeRequestResponse } from '@/src/types/profile';

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

function unwrap(response: unknown): Record<string, unknown> {
  const root = asRecord(response) ?? {};
  return asRecord(root.data) ?? asRecord(root.customer) ?? root;
}

export function normalizeCustomer(response: unknown): Customer | null {
  const data = unwrap(response);
  const customerId = asString(data.customerId) ?? asString(data.id);
  const phone = asString(data.phone) ?? asString(data.mobile);
  if (!customerId || !phone) {
    return null;
  }
  return {
    customerId,
    phone,
    name: asString(data.name) ?? null,
    email: asString(data.email) ?? null,
    profileImage:
      asString(data.profileImage) ?? asString(data.avatar) ?? asString(data.image) ?? null,
    status: asString(data.status),
  };
}

export function normalizePhoneChangeRequest(response: unknown): PhoneChangeRequestResponse | null {
  const data = unwrap(response);
  const challengeId = asString(data.challengeId);
  if (!challengeId) {
    return null;
  }
  return {
    challengeId,
    expiresIn: asNumber(data.expiresIn) ?? 60,
    otpLength: asNumber(data.otpLength) ?? asNumber(data.length),
  };
}

/** UI-level email check. Backend remains authoritative. */
export function isPlausibleEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}
