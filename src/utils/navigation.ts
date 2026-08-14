import type { Href } from 'expo-router';

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
