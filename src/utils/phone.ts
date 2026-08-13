/** Phone helpers for India launch (INR / +91). */

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

export function normalizeIndianPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

export function isValidIndianMobile(input: string): boolean {
  return INDIAN_MOBILE.test(normalizeIndianPhone(input));
}

export function toE164India(input: string): string {
  return `+91${normalizeIndianPhone(input)}`;
}

export function formatPhoneDisplay(input: string): string {
  const normalized = normalizeIndianPhone(input);
  if (normalized.length !== 10) {
    return input;
  }
  return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
}
