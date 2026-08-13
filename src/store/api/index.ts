/**
 * Placeholder API module shells.
 * Inject real endpoints only after backend contract confirmation.
 */

import { baseApi } from './baseApi';

// These empty injectors reserve module boundaries without inventing URLs.
export const authApi = baseApi.injectEndpoints({
  endpoints: () => ({}),
  overrideExisting: false,
});

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
