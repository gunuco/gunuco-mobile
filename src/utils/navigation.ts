import type { Href } from 'expo-router';
import type { NotificationDeepLink } from '@/src/types/notification';
import type { LegalType } from '@/src/types/legal';

/**
 * Typed Expo Router hrefs for catalogue navigation.
 * Double-cast until Expo typedRoutes fully picks up new `category` / `product` trees.
 */
export function categoryHref(categoryId: string): Href {
  return {
    pathname: '/category/[id]',
    params: { id: categoryId },
  } as unknown as Href;
}

export function categoryProductsHref(categoryId: string): Href {
  return {
    pathname: '/category/[id]/products',
    params: { id: categoryId },
  } as unknown as Href;
}

export function productHref(productId: string): Href {
  return {
    pathname: '/product/[id]',
    params: { id: productId },
  } as unknown as Href;
}

export function productReviewsHref(productId: string): Href {
  return {
    pathname: '/product/[id]/reviews',
    params: { id: productId },
  } as unknown as Href;
}

export function writeReviewHref(orderItemId: string, productId?: string): Href {
  return {
    pathname: '/review/write',
    params: productId ? { orderItemId, productId } : { orderItemId },
  } as unknown as Href;
}

export function checkoutHref(): Href {
  return '/checkout' as unknown as Href;
}

export function paymentHref(checkoutId?: string): Href {
  return {
    pathname: '/payment',
    params: checkoutId ? { checkoutId } : {},
  } as unknown as Href;
}

export function orderConfirmationHref(): Href {
  return '/order-confirmation' as unknown as Href;
}

export function ordersHref(): Href {
  return '/(tabs)/my-orders' as unknown as Href;
}

export function cartHref(): Href {
  return '/(tabs)/cart' as unknown as Href;
}

export function searchHref(): Href {
  return '/(tabs)/search' as unknown as Href;
}

export function profileHref(): Href {
  return '/(tabs)/profile' as unknown as Href;
}

export function reorderHref(): Href {
  return '/(tabs)/reorder' as unknown as Href;
}

export function orderHref(orderId: string): Href {
  return {
    pathname: '/orders/[id]',
    params: { id: orderId },
  } as unknown as Href;
}

export function orderTrackingHref(orderId: string): Href {
  return {
    pathname: '/orders/[id]/tracking',
    params: { id: orderId },
  } as unknown as Href;
}

export function orderChatHref(orderId: string): Href {
  return {
    pathname: '/orders/[id]/rider-chat',
    params: { id: orderId },
  } as unknown as Href;
}

export function orderCancelHref(orderId: string): Href {
  return {
    pathname: '/orders/[id]/cancel',
    params: { id: orderId },
  } as unknown as Href;
}

export function orderComplaintHref(orderId: string): Href {
  return {
    pathname: '/orders/[id]/complaint',
    params: { id: orderId },
  } as unknown as Href;
}

export function addressBookHref(options?: { select?: boolean }): Href {
  return {
    pathname: '/addresses',
    params: options?.select ? { select: '1' } : {},
  } as unknown as Href;
}

export function addressFormHref(id?: string): Href {
  return {
    pathname: '/addresses/form',
    params: id ? { id } : {},
  } as unknown as Href;
}

export function notificationsHref(): Href {
  return '/notifications' as unknown as Href;
}

export function supportHref(): Href {
  return '/support' as unknown as Href;
}

export function supportCreateHref(orderId?: string): Href {
  return {
    pathname: '/support/create',
    params: orderId ? { orderId } : {},
  } as unknown as Href;
}

export function supportTicketHref(ticketId: string): Href {
  return {
    pathname: '/support/[id]',
    params: { id: ticketId },
  } as unknown as Href;
}

export function editProfileHref(): Href {
  return '/profile/edit' as unknown as Href;
}

export function changePhoneHref(): Href {
  return '/profile/change-phone' as unknown as Href;
}

export function changePhoneOtpHref(): Href {
  return '/profile/change-phone-otp' as unknown as Href;
}

export function settingsHref(): Href {
  return '/settings' as unknown as Href;
}

export function uiTestHref(): Href {
  return '/ui-test' as unknown as Href;
}

export function legalHref(): Href {
  return '/legal' as unknown as Href;
}

export function legalDocumentHref(type: LegalType): Href {
  return {
    pathname: '/legal/[type]',
    params: { type },
  } as unknown as Href;
}

export function storeCreditHref(): Href {
  return '/store-credit' as unknown as Href;
}

export function notificationDestinationHref(link: NotificationDeepLink): Href {
  switch (link.kind) {
    case 'order':
      return orderHref(link.orderId);
    case 'tracking':
      return orderTrackingHref(link.orderId);
    case 'ticket':
      return supportTicketHref(link.ticketId);
    case 'review':
      return writeReviewHref(link.orderItemId, link.productId);
    default:
      return notificationsHref();
  }
}

export function notificationDestinationPath(link: NotificationDeepLink): string {
  switch (link.kind) {
    case 'order':
      return `/orders/${link.orderId}`;
    case 'tracking':
      return `/orders/${link.orderId}/tracking`;
    case 'ticket':
      return `/support/${link.ticketId}`;
    case 'review': {
      const params = new URLSearchParams({ orderItemId: link.orderItemId });
      if (link.productId) {
        params.set('productId', link.productId);
      }
      return `/review/write?${params.toString()}`;
    }
    default:
      return '/notifications';
  }
}
