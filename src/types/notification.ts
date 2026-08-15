/** Customer notification inbox + push registration. Field names remain [CONFIRM]. */

export type PushPlatform = 'ios' | 'android';

export type PushTokenPayload = {
  token: string;
  platform: PushPlatform;
};

export type NotificationDeepLink =
  | { kind: 'order'; orderId: string }
  | { kind: 'tracking'; orderId: string }
  | { kind: 'ticket'; ticketId: string }
  | { kind: 'review'; orderItemId: string; productId?: string };

export type CustomerNotification = {
  id: string;
  title: string;
  body: string;
  createdAt?: string;
  createdAtLabel?: string;
  read: boolean;
  type?: string;
  typeLabel?: string;
  deepLink?: NotificationDeepLink;
};

export type NotificationListArgs = {
  page?: number;
};

export type NotificationListResponse = {
  items: CustomerNotification[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

export type PushPermissionState = 'not_requested' | 'granted' | 'denied' | 'unavailable';
