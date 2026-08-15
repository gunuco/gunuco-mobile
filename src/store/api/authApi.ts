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
import type {
  PhoneChangeRequestPayload,
  PhoneChangeRequestResponse,
  PhoneChangeVerifyPayload,
  UpdateCustomerPayload,
} from '@/src/types/profile';
import { normalizeCustomer, normalizePhoneChangeRequest } from '@/src/utils/customer';

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
    updateMe: build.mutation<Customer, UpdateCustomerPayload>({
      query: (body) => ({
        url: '/customers/me',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) => {
        const customer = normalizeCustomer(response);
        if (!customer) {
          throw new Error('PROFILE_UPDATE_INVALID');
        }
        return customer;
      },
      invalidatesTags: ['Customer'],
    }),
    requestPhoneChange: build.mutation<PhoneChangeRequestResponse, PhoneChangeRequestPayload>({
      query: (body) => ({
        url: '/auth/phone/change/request',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => {
        const result = normalizePhoneChangeRequest(response);
        if (!result) {
          throw new Error('PHONE_CHANGE_INVALID');
        }
        return result;
      },
    }),
    verifyPhoneChange: build.mutation<Customer, PhoneChangeVerifyPayload>({
      query: (body) => ({
        url: '/auth/phone/change/verify',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => {
        const customer = normalizeCustomer(response);
        if (!customer) {
          throw new Error('PHONE_CHANGE_INVALID');
        }
        return customer;
      },
      invalidatesTags: ['Customer', 'Auth'],
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
  useUpdateMeMutation,
  useRequestPhoneChangeMutation,
  useVerifyPhoneChangeMutation,
} = authApi;
