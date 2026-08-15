export type EvidencePhoto = {
  uri: string;
  name: string;
  mimeType: string;
};

export type CreateComplaintPayload = {
  orderId: string;
  reasonCode?: string;
  message: string;
  idempotencyKey: string;
  photos: EvidencePhoto[];
};

export type CreateComplaintResult = {
  success: boolean;
  ticketId?: string;
  message?: string | null;
};

export const COMPLAINT_REASONS = [
  { code: 'WRONG_PRODUCT', label: 'Wrong product' },
  { code: 'MISSING_PRODUCT', label: 'Missing product' },
  { code: 'DAMAGED_PRODUCT', label: 'Damaged product' },
  { code: 'QUALITY_ISSUE', label: 'Quality issue' },
  { code: 'OTHER', label: 'Other' },
] as const;
