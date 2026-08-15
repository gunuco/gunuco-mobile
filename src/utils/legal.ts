import { LEGAL_TYPES, type LegalDocument, type LegalType } from '@/src/types/legal';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function unwrap(response: unknown): Record<string, unknown> {
  const root = asRecord(response) ?? {};
  return asRecord(root.data) ?? asRecord(root.document) ?? asRecord(root.legal) ?? root;
}

export function isLegalType(value: string | undefined): value is LegalType {
  return Boolean(value && (LEGAL_TYPES as readonly string[]).includes(value));
}

export function legalTitle(type: LegalType): string {
  switch (type) {
    case 'terms':
      return 'Terms & Conditions';
    case 'privacy':
      return 'Privacy Policy';
    case 'refund':
      return 'Refund Policy';
    case 'cancellation':
      return 'Cancellation Policy';
    default:
      return 'Legal';
  }
}

export function normalizeLegalDocument(response: unknown, type: LegalType): LegalDocument | null {
  if (typeof response === 'string' && response.trim()) {
    const text = response.trim();
    const looksLikeUrl = /^https?:\/\//i.test(text);
    return {
      type,
      title: legalTitle(type),
      content: looksLikeUrl ? undefined : text,
      url: looksLikeUrl ? text : undefined,
      fetchedAt: Date.now(),
    };
  }

  const data = unwrap(response);
  const url = asString(data.url) ?? asString(data.href) ?? asString(data.link);
  const content =
    asString(data.content) ??
    asString(data.markdown) ??
    asString(data.body) ??
    asString(data.text) ??
    asString(data.html);
  if (!url && !content) {
    return null;
  }
  return {
    type,
    title: asString(data.title) ?? legalTitle(type),
    content,
    url,
    fetchedAt: Date.now(),
  };
}
