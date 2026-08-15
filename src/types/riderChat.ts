export type RiderChatSender = 'CUSTOMER' | 'RIDER' | 'SYSTEM';

export type RiderChatMessage = {
  id: string;
  sender: RiderChatSender;
  text: string;
  createdAt?: string;
  createdAtLabel?: string;
  read?: boolean;
};

export type RiderChatArgs = {
  orderId: string;
  page?: number;
};

export type RiderChatThread = {
  items: RiderChatMessage[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  available?: boolean;
  message?: string | null;
};

export type SendRiderChatPayload = {
  orderId: string;
  text: string;
};
