import { baseApi } from './baseApi';
import type {
  NotificationListArgs,
  NotificationListResponse,
  PushTokenPayload,
} from '@/src/types/notification';
import {
  mergeNotificationListPages,
  normalizeNotificationList,
  notificationsListCacheKey,
} from '@/src/utils/notifications';

const notificationListTag = { type: 'Notification' as const, id: 'LIST' };

/**
 * Notifications — logical paths from docs/api-requirements.md:
 * POST devices/push-token
 * GET notifications?page=
 * POST notifications/{id}/read
 * POST notifications/read-all is [CONFIRM] and is not implemented.
 */
export const notificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    registerPushToken: build.mutation<{ ok: boolean }, PushTokenPayload>({
      query: (body) => ({
        url: '/devices/push-token',
        method: 'POST',
        body: {
          token: body.token,
          platform: body.platform,
        },
      }),
    }),
    getNotifications: build.query<NotificationListResponse, NotificationListArgs | void>({
      query: (args) => ({
        url: '/notifications',
        params: typeof args?.page === 'number' && args.page > 0 ? { page: args.page } : {},
      }),
      transformResponse: (response: unknown, _meta, arg) =>
        normalizeNotificationList(response, arg?.page),
      providesTags: (result) => [
        notificationListTag,
        ...(result?.items.map((item) => ({ type: 'Notification' as const, id: item.id })) ?? []),
      ],
      serializeQueryArgs: ({ queryArgs }) => notificationsListCacheKey(queryArgs ?? {}),
      merge: (currentCache, newItems) => mergeNotificationListPages(currentCache, newItems),
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
    markNotificationRead: build.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Notification', id },
        notificationListTag,
        'Home',
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useRegisterPushTokenMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} = notificationApi;
