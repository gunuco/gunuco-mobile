/**
 * API module shells. Auth endpoints live in authApi.ts.
 * Home endpoints live in homeApi.ts.
 * Catalogue: categoryApi.ts + productApi.ts (search + detail).
 * Cart: cartApi.ts (server cart + coupon + store credit apply/remove).
 * Addresses: addressApi.ts. Fulfilment: fulfilmentApi.ts. Checkout: checkoutApi.ts.
 * Payments: paymentApi.ts. Store credit balance: storeCreditApi.ts.
 * Orders: orderApi.ts. Tracking: trackingApi.ts. Rider chat: chatApi.ts.
 * Complaint create: supportApi.ts (no Support Hub).
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
export {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useRevalidateCartMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
  useApplyStoreCreditMutation,
  useRemoveStoreCreditMutation,
} from './cartApi';

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

export { addressApi } from './addressApi';
export {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} from './addressApi';

export { fulfilmentApi } from './fulfilmentApi';
export {
  useCheckServiceabilityMutation,
  useGetFulfilmentSlotsQuery,
  useGetPickupInfoQuery,
} from './fulfilmentApi';

export { checkoutApi } from './checkoutApi';
export { useCreateCheckoutMutation } from './checkoutApi';

export { storeCreditApi } from './storeCreditApi';
export { useGetStoreCreditQuery } from './storeCreditApi';

export { paymentApi } from './paymentApi';
export {
  useInitiateRazorpayPaymentMutation,
  useConfirmRazorpayPaymentMutation,
} from './paymentApi';

export { orderApi } from './orderApi';
export {
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetCancellationEligibilityQuery,
  useCancelOrderMutation,
  useReorderOrderMutation,
  useLazyGetOrderInvoiceQuery,
} from './orderApi';

export { trackingApi } from './trackingApi';
export { useGetOrderTrackingQuery, useGetOrderRiderQuery } from './trackingApi';

export { chatApi } from './chatApi';
export { useGetRiderChatMessagesQuery, useSendRiderChatMessageMutation } from './chatApi';

export { supportApi } from './supportApi';
export { useCreateComplaintMutation } from './supportApi';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: () => ({}),
  overrideExisting: false,
});
