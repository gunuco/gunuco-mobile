export const LEGAL_TYPES = ['terms', 'privacy', 'refund', 'cancellation'] as const;

export type LegalType = (typeof LEGAL_TYPES)[number];

export type LegalDocument = {
  type: LegalType;
  title: string;
  /** Markdown or plain text from the backend. */
  content?: string;
  /** Remote URL when the backend serves a hosted document. */
  url?: string;
  fetchedAt: number;
};
