import { baseApi } from './baseApi';
import type {
  Customer,
  OtpRequestPayload,
  OtpRequestResponse,
  OtpVerifyPayload,
  OtpVerifyResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
} from '@/src/types/auth';

/**
 * Auth endpoints from docs/api-requirements.md (logical paths).
 * Exact backend OpenAPI may refine field names — keep mapping in one place.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    requestOtp: build.mutation<OtpRequestResponse, OtpRequestPayload>({
      query: (body) => ({
        url: '/auth/otp/request',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: build.mutation<OtpVerifyResponse, OtpVerifyPayload>({
      query: (body) => ({
        url: '/auth/otp/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth', 'Customer'],
    }),
    refreshToken: build.mutation<RefreshTokenResponse, RefreshTokenPayload>({
      query: (body) => ({
        url: '/auth/token/refresh',
        method: 'POST',
        body,
      }),
    }),
    logout: build.mutation<{ ok: boolean }, { refreshToken?: string } | void>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body: body ?? {},
      }),
      invalidatesTags: ['Auth', 'Customer', 'Cart', 'Wishlist'],
    }),
    getMe: build.query<Customer, void>({
      query: () => '/customers/me',
      providesTags: ['Customer'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi;
