/**
 * API module shells. Auth endpoints live in authApi.ts.
 * Other domains remain empty until contracts are confirmed.
 */

import { baseApi } from './baseApi';

export { authApi } from './authApi';
export {
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} from './authApi';

export const productApi = baseApi.injectEndpoints({
  endpoints: () => ({}),
  overrideExisting: false,
});

export const categoryApi = baseApi.injectEndpoints({
  endpoints: () => ({}),
  overrideExisting: false,
});

export const cartApi = baseApi.injectEndpoints({
  endpoints: () => ({}),
  overrideExisting: false,
});

export const addressApi = baseApi.injectEndpoints({
  endpoints: () => ({}),
  overrideExisting: false,
});

export const orderApi = baseApi.injectEndpoints({
  endpoints: () => ({}),
  overrideExisting: false,
});

export const paymentApi = baseApi.injectEndpoints({
  endpoints: () => ({}),
  overrideExisting: false,
});

export const notificationApi = baseApi.injectEndpoints({
  endpoints: () => ({}),
  overrideExisting: false,
});
