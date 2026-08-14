import type { Address, AddressListResponse, AddressPayload } from '@/src/types/address';
import type { AddressSummary } from '@/src/types/commerce';

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

export function isValidIndianPincode(input: string): boolean {
  return /^\d{6}$/.test(input.trim());
}

export function toAddressSummary(address: Address): AddressSummary {
  const line1 = [address.house, address.street].filter(Boolean).join(', ');
  const line2 = [address.area, address.landmark].filter(Boolean).join(', ');
  return {
    id: address.id,
    addressType: address.addressType,
    name: address.name,
    phone: address.phone,
    line1,
    line2: line2 || undefined,
    city: address.city,
    pincode: address.pincode,
    isDefault: address.isDefault,
  };
}

export function normalizeAddress(raw: unknown): Address | null {
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }
  const nested = asRecord(rec.address) ?? rec;
  const id = asString(nested.id) ?? asString(nested.addressId);
  const name = asString(nested.name);
  const house = asString(nested.house) ?? asString(nested.houseNo) ?? asString(nested.line1);
  const street = asString(nested.street) ?? asString(nested.line2) ?? '';
  const city = asString(nested.city);
  const pincode = asString(nested.pincode) ?? asString(nested.pinCode);
  const lat = asNumber(nested.lat) ?? asNumber(nested.latitude);
  const lng = asNumber(nested.lng) ?? asNumber(nested.longitude);
  if (!id || !name || !house || !city || !pincode || lat === undefined || lng === undefined) {
    return null;
  }
  return {
    id,
    addressType: asString(nested.addressType) ?? asString(nested.type) ?? 'Other',
    name,
    phone: asString(nested.phone),
    house,
    street,
    area: asString(nested.area) ?? asString(nested.locality) ?? '',
    landmark: asString(nested.landmark) ?? null,
    city,
    state: asString(nested.state) ?? '',
    pincode,
    lat,
    lng,
    isDefault: asBoolean(nested.isDefault),
  };
}

export function normalizeAddressList(response: unknown): AddressListResponse {
  const root = asRecord(response) ?? {};
  const data = asRecord(root.data) ?? root;
  const rawItems = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.addresses)
      ? data.addresses
      : Array.isArray(root.addresses)
        ? root.addresses
        : Array.isArray(root.items)
          ? root.items
          : [];
  const items: Address[] = [];
  const seen = new Set<string>();
  for (const raw of rawItems) {
    const address = normalizeAddress(raw);
    if (!address || seen.has(address.id)) {
      continue;
    }
    seen.add(address.id);
    items.push(address);
  }
  return { items };
}

export function toAddressPayload(address: {
  addressType: Address['addressType'];
  name: string;
  phone?: string;
  house: string;
  street: string;
  area: string;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
}): AddressPayload {
  return {
    addressType: address.addressType,
    name: address.name.trim(),
    phone: (address.phone ?? '').trim(),
    house: address.house.trim(),
    street: address.street.trim(),
    area: address.area.trim(),
    landmark: address.landmark?.trim() || undefined,
    city: address.city.trim(),
    state: address.state.trim(),
    pincode: address.pincode.trim(),
    lat: address.lat,
    lng: address.lng,
    isDefault: address.isDefault,
  };
}
