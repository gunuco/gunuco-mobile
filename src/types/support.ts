import type { EvidencePhoto } from './complaint';

/** Backend/admin ticket statuses. Do not invent additional values. */
export type SupportTicketStatus = 'NEW' | 'OPEN' | 'PENDING' | 'CLOSED' | 'UNKNOWN';

export type SupportActor = 'customer' | 'support';

export type SupportMessage = {
  id: string;
  actor: SupportActor;
  body: string;
  createdAt?: string;
  createdAtLabel?: string;
};

export type SupportTicketSummary = {
  id: string;
  displayId?: string;
  status: SupportTicketStatus;
  statusLabel: string;
  preview?: string;
  orderId?: string;
  createdAt?: string;
  createdAtLabel?: string;
  updatedAt?: string;
  updatedAtLabel?: string;
};

export type SupportTicketDetail = SupportTicketSummary & {
  subject?: string;
  replyAllowed: boolean;
  messages: SupportMessage[];
};

export type SupportTicketListArgs = {
  page?: number;
};

export type SupportTicketListResponse = {
  items: SupportTicketSummary[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

export type CreateSupportTicketPayload = {
  orderId?: string;
  message: string;
  reasonCode?: string;
  idempotencyKey: string;
  photos: EvidencePhoto[];
};

export type CreateSupportTicketResult = {
  success: boolean;
  ticketId?: string;
  message?: string | null;
};

export type SendSupportMessagePayload = {
  ticketId: string;
  message: string;
};
