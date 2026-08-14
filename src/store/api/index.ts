/**
 * API module shells. Auth endpoints live in authApi.ts.
 * Home endpoints live in homeApi.ts.
 * Catalogue: categoryApi.ts + productApi.ts (search + detail).
 * Cart: cartApi.ts (add item mutation for Product Details).
 * Wishlist: wishlistApi.ts. Reviews: reviewApi.ts.
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

export { homeApi } from './homeApi';
export { useGetHomeQuery, useLazyGetHomeQuery } from './homeApi';

export { categoryApi } from './categoryApi';
export {
  useGetCategoriesQuery,
  useLazyGetCategoriesQuery,
  useGetCategoryProductsQuery,
  useLazyGetCategoryProductsQuery,
} from './categoryApi';

export { productApi } from './productApi';
export {
  useSearchProductsQuery,
  useLazySearchProductsQuery,
  useGetProductQuery,
  useGetProductOptionsQuery,
} from './productApi';

export { cartApi } from './cartApi';
export { useAddCartItemMutation } from './cartApi';

export { wishlistApi } from './wishlistApi';
export {
  useGetWishlistQuery,
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
} from './wishlistApi';

export { reviewApi } from './reviewApi';
export {
  useGetProductReviewsQuery,
  useGetReviewableItemsQuery,
  useCreateReviewMutation,
} from './reviewApi';

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
