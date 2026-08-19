import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { AddressPayload } from '@/src/types/address';
import type { CheckoutPayload } from '@/src/types/checkout';
import type { FulfilmentType } from '@/src/types/fulfilment';
import type { LegalType } from '@/src/types/legal';
import type { OrderStatusGroup } from '@/src/types/order';
import type { AddCartItemPayload } from '@/src/types/product';
import {
  CATEGORIES,
  CATEGORY_CAKES,
  LEGAL_COPY,
  PAGE_SIZE,
  PICKUP_INFO,
  UI_TEST_RAZORPAY_KEY,
  catalogFilters,
  applyCatalogFilters,
  categoryDisplayName,
  findProduct,
  homePayload,
  isServiceablePoint,
  productDetailPayload,
  productOptionsPayload,
  productSummary,
  productsForCategory,
  searchProducts,
} from './fixtures';
import * as repo from './repository';
import {
  UI_TEST_CUSTOMERS,
  UI_TEST_OTP,
  accessTokenFor,
  customerIdFromToken,
  getUiTestScenario,
  refreshTokenFor,
  type UiTestCustomerId,
} from './scenarios';

export type MockResult =
  { data: unknown } | { error: { status: number | string; data?: unknown; error?: string } };

type ParsedRequest = {
  method: string;
  path: string;
  params: Record<string, string>;
  body: Record<string, unknown>;
  isFormData: boolean;
};

const guestChallenges = new Map<string, UiTestCustomerId>();

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function parseRequest(args: string | FetchArgs): ParsedRequest {
  const url = typeof args === 'string' ? args : args.url;
  const method = (typeof args === 'string' ? 'GET' : (args.method ?? 'GET')).toUpperCase();
  const [pathPart, queryString] = url.split('?');
  const path = (pathPart ?? url).replace(/\/$/, '') || '/';
  const params: Record<string, string> = {};
  if (queryString) {
    new URLSearchParams(queryString).forEach((value, key) => {
      params[key] = value;
    });
  }
  if (typeof args !== 'string' && args.params && typeof args.params === 'object') {
    Object.entries(args.params as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = String(value);
      }
    });
  }
  const rawBody = typeof args === 'string' ? undefined : args.body;
  const isFormData = Boolean(
    rawBody && typeof rawBody === 'object' && 'append' in (rawBody as object),
  );
  return {
    method,
    path,
    params,
    body: isFormData ? {} : asRecord(rawBody),
    isFormData,
  };
}

function httpError(status: number, code: string, message: string): MockResult {
  return { error: { status, data: { code, message } } };
}

function paginate<T>(
  items: T[],
  pageRaw: string | undefined,
): {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
} {
  const page = Math.max(1, asNumber(pageRaw) ?? 1);
  const start = (page - 1) * PAGE_SIZE;
  const slice = items.slice(start, start + PAGE_SIZE);
  return {
    items: slice,
    page,
    pageSize: PAGE_SIZE,
    total: items.length,
    hasMore: start + PAGE_SIZE < items.length,
  };
}

function customerFromPhone(phone: string): UiTestCustomerId {
  const digits = phone.replace(/\D/g, '');
  const last10 = digits.length > 10 ? digits.slice(-10) : digits;
  if (last10 === UI_TEST_CUSTOMERS['ui-test-customer-b'].phone) {
    return 'ui-test-customer-b';
  }
  return 'ui-test-customer-a';
}

function requireAuth(): MockResult | null {
  if (!repo.getCurrentCustomerId()) {
    return httpError(401, 'UNAUTHORIZED', 'Please sign in again.');
  }
  return null;
}

function applyGlobalScenario(req: ParsedRequest): MockResult | null {
  const scenario = getUiTestScenario();
  const isPublic =
    req.method === 'GET' &&
    (req.path === '/customer/home' ||
      req.path === '/app/config' ||
      req.path.startsWith('/legal/') ||
      req.path.startsWith('/categories') ||
      req.path.startsWith('/products/'));
  const isOtp = req.path.startsWith('/auth/otp/');

  if (scenario === 'NETWORK_ERROR') {
    return { error: { status: 'FETCH_ERROR', error: 'Network request failed' } };
  }
  if (scenario === 'TIMEOUT') {
    return { error: { status: 'TIMEOUT_ERROR' } };
  }
  if (scenario === 'SERVER_ERROR') {
    return httpError(500, 'SERVER_ERROR', 'Our servers are having trouble right now.');
  }
  if (scenario === 'UNAUTHORIZED' && !isPublic && !isOtp) {
    return httpError(401, 'UNAUTHORIZED', 'Please sign in again.');
  }
  if (scenario === 'FORBIDDEN' && !isPublic && !isOtp) {
    return httpError(403, 'FORBIDDEN', 'We could not find what you were looking for.');
  }
  if (scenario === 'NOT_FOUND' && !isOtp && req.path !== '/app/config') {
    return httpError(404, 'NOT_FOUND', 'We could not find what you were looking for.');
  }
  if (scenario === 'VALIDATION_ERROR' && req.method !== 'GET' && !isOtp) {
    return httpError(422, 'VALIDATION_ERROR', 'Please check the details and try again.');
  }
  return null;
}

export function handleMockRequest(args: string | FetchArgs): MockResult {
  const req = parseRequest(args);
  const blocked = applyGlobalScenario(req);
  if (blocked) {
    return blocked;
  }

  try {
    return route(req);
  } catch (error) {
    const code = error instanceof Error ? error.message : 'SERVER_ERROR';
    if (code === 'UNAUTHENTICATED') {
      return httpError(401, 'UNAUTHORIZED', 'Please sign in again.');
    }
    const status = code.includes('NOT_FOUND') ? 404 : code.includes('COUPON') ? 422 : 422;
    return httpError(status, code, code);
  }
}

function route(req: ParsedRequest): MockResult {
  const { method, path, params, body } = req;
  const empty = getUiTestScenario() === 'EMPTY';

  if (method === 'GET' && path === '/app/config') {
    const scenario = getUiTestScenario();
    return {
      data: {
        forceUpdate: scenario === 'FORCE_UPDATE',
        maintenanceMode: scenario === 'MAINTENANCE',
        minVersion: scenario === 'FORCE_UPDATE' ? '99.0.0' : '0.1.0',
        latestVersion: '0.1.0',
        maintenanceMessage:
          'GUNUCO is temporarily unavailable. This is a UI-test maintenance state.',
        storeUrls: {
          android: 'https://play.google.com/store/apps/details?id=com.gunuco.customer',
          ios: 'https://apps.apple.com/app/id000000000',
        },
      },
    };
  }

  if (method === 'GET' && path.startsWith('/legal/')) {
    const type = path.replace('/legal/', '') as LegalType;
    const doc = LEGAL_COPY[type];
    if (!doc) {
      return httpError(404, 'NOT_FOUND', 'Document not found.');
    }
    return { data: doc };
  }

  if (method === 'POST' && path === '/auth/otp/request') {
    const phone = asString(body.phone) ?? '';
    const customerId = customerFromPhone(phone);
    const challengeId = `ui-test-challenge-${Date.now()}`;
    guestChallenges.set(challengeId, customerId);
    return { data: { challengeId, expiresIn: 300 } };
  }

  if (method === 'POST' && path === '/auth/otp/verify') {
    const otp = asString(body.otp);
    const challengeId = asString(body.challengeId);
    if (otp !== UI_TEST_OTP) {
      return httpError(422, 'OTP_INVALID', 'That code is not valid. Please try again.');
    }
    const customerId =
      (challengeId && guestChallenges.get(challengeId)) ||
      customerFromPhone(asString(body.phone) ?? '');
    repo.setCurrentCustomerId(customerId);
    const customer = repo.storeFor(customerId).customer;
    return {
      data: {
        accessToken: accessTokenFor(customerId),
        refreshToken: refreshTokenFor(customerId),
        customer,
        isNewUser: false,
      },
    };
  }

  if (method === 'POST' && path === '/auth/token/refresh') {
    const token = asString(body.refreshToken);
    const customerId = customerIdFromToken(token);
    if (!customerId) {
      return httpError(401, 'UNAUTHORIZED', 'Please sign in again.');
    }
    repo.setCurrentCustomerId(customerId);
    return {
      data: {
        accessToken: accessTokenFor(customerId),
        refreshToken: refreshTokenFor(customerId),
      },
    };
  }

  if (method === 'POST' && path === '/auth/logout') {
    repo.logoutMockSession();
    return { data: { ok: true } };
  }

  if (method === 'GET' && path === '/customer/home') {
    const wishlisted = (id: string) => repo.wishlistIds().includes(id);
    return { data: homePayload(wishlisted, repo.unreadCount(), empty) };
  }

  if (method === 'GET' && path === '/categories') {
    if (empty) {
      return { data: { categories: [] } };
    }
    return { data: { categories: CATEGORIES } };
  }

  if (method === 'GET' && /^\/categories\/[^/]+\/products$/.test(path)) {
    const categoryId = path.split('/')[2] ?? CATEGORY_CAKES;
    const list = empty ? [] : applyCatalogFilters(productsForCategory(categoryId), params);
    const wishlisted = (id: string) => repo.wishlistIds().includes(id);
    const sorted = sortProducts(list, params.sort).map((item) =>
      productSummary(item, wishlisted(item.id)),
    );
    return {
      data: {
        ...paginate(sorted, params.page),
        category: { id: categoryId, name: categoryDisplayName(categoryId) },
        ...catalogFilters(),
      },
    };
  }

  if (method === 'GET' && path === '/products/search') {
    const q = params.q ?? '';
    const list = empty ? [] : applyCatalogFilters(searchProducts(q), params);
    const wishlisted = (id: string) => repo.wishlistIds().includes(id);
    const sorted = sortProducts(list, params.sort).map((item) =>
      productSummary(item, wishlisted(item.id)),
    );
    return { data: { ...paginate(sorted, params.page), ...catalogFilters() } };
  }

  if (method === 'GET' && /^\/products\/[^/]+\/options$/.test(path)) {
    const id = path.split('/')[2] ?? '';
    const product = findProduct(id);
    if (!product) {
      return httpError(404, 'PRODUCT_NOT_FOUND', 'This product is not available right now.');
    }
    return { data: productOptionsPayload(product) };
  }

  if (method === 'GET' && /^\/products\/[^/]+\/reviews$/.test(path)) {
    const id = path.split('/')[2] ?? '';
    const items = empty ? [] : repo.reviewsFor(id);
    return {
      data: { ...paginate(items, params.page), ratingAverage: 4.5, ratingCount: items.length },
    };
  }

  if (method === 'GET' && /^\/products\/[^/]+$/.test(path)) {
    const id = path.split('/')[2] ?? '';
    const product = findProduct(id);
    if (!product) {
      return httpError(404, 'PRODUCT_NOT_FOUND', 'This product is not available right now.');
    }
    return {
      data: { product: productDetailPayload(product, repo.wishlistIds().includes(id)) },
    };
  }

  const authError = requireAuth();
  const privateAuth =
    path.startsWith('/auth/') ||
    path === '/customers/me' ||
    path.startsWith('/wishlist') ||
    path.startsWith('/cart') ||
    path.startsWith('/addresses') ||
    path.startsWith('/fulfilment') ||
    path.startsWith('/checkout') ||
    path.startsWith('/store-credit') ||
    path.startsWith('/payments') ||
    path.startsWith('/orders') ||
    path.startsWith('/reviews') ||
    path.startsWith('/notifications') ||
    path.startsWith('/devices') ||
    path.startsWith('/support');

  if (privateAuth && authError) {
    return authError;
  }

  if (method === 'GET' && path === '/customers/me') {
    const store = repo.requireStore();
    if (!store) {
      return httpError(401, 'UNAUTHORIZED', 'Please sign in again.');
    }
    return { data: store.customer };
  }

  if (method === 'PATCH' && path === '/customers/me') {
    const customer = repo.updateProfile(
      asString(body.name),
      asString(body.email) ?? (body.email === null ? null : undefined),
    );
    return { data: { customer } };
  }

  if (method === 'POST' && path === '/auth/phone/change/request') {
    const challengeId = `ui-test-phone-${Date.now()}`;
    const newPhone = asString(body.newPhone) ?? '';
    repo.setPhoneChangeChallenge(challengeId, newPhone);
    return { data: { challengeId, expiresIn: 300, otpLength: 6 } };
  }

  if (method === 'POST' && path === '/auth/phone/change/verify') {
    if (asString(body.otp) !== UI_TEST_OTP) {
      return httpError(422, 'OTP_INVALID', 'That code is not valid. Please try again.');
    }
    return { data: { customer: repo.applyPhoneChange() } };
  }

  if (method === 'GET' && path === '/wishlist') {
    if (empty) {
      return { data: { items: [] } };
    }
    const items = repo
      .wishlistIds()
      .map((id) => findProduct(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => productSummary(item, true));
    return { data: { items } };
  }

  if (method === 'POST' && /^\/wishlist\/[^/]+$/.test(path)) {
    repo.addWishlist(path.split('/')[2] ?? '');
    return { data: {} };
  }

  if (method === 'DELETE' && /^\/wishlist\/[^/]+$/.test(path)) {
    repo.removeWishlist(path.split('/')[2] ?? '');
    return { data: {} };
  }

  if (method === 'GET' && path === '/cart') {
    if (empty) {
      return { data: { cart: { items: [], totals: { totalPaise: 0 }, itemCount: 0 } } };
    }
    return { data: { cart: repo.getCart() } };
  }

  if (method === 'POST' && path === '/cart/items') {
    const payload: AddCartItemPayload = {
      productId: asString(body.productId) ?? '',
      quantity: asNumber(body.quantity) ?? 1,
      options: Array.isArray(body.options) ? (body.options as AddCartItemPayload['options']) : [],
    };
    return { data: repo.addCartItem(payload) };
  }

  if (method === 'PATCH' && /^\/cart\/items\/[^/]+$/.test(path)) {
    const itemId = path.split('/')[3] ?? '';
    return { data: { cart: repo.updateCartQty(itemId, asNumber(body.quantity) ?? 1) } };
  }

  if (method === 'DELETE' && /^\/cart\/items\/[^/]+$/.test(path)) {
    const itemId = path.split('/')[3] ?? '';
    return { data: { cart: repo.removeCartItem(itemId) } };
  }

  if (method === 'POST' && path === '/cart/revalidate') {
    return { data: { cart: repo.revalidateCart() } };
  }

  if (method === 'POST' && path === '/cart/apply-coupon') {
    if (getUiTestScenario() === 'COUPON_FAILED') {
      return httpError(422, 'COUPON_INVALID', 'This coupon code is not valid.');
    }
    return { data: { cart: repo.applyCoupon(asString(body.code) ?? '') } };
  }

  if (method === 'DELETE' && path === '/cart/coupon') {
    return { data: { cart: repo.removeCoupon() } };
  }

  if (method === 'POST' && path === '/cart/apply-store-credit') {
    return { data: { cart: repo.applyStoreCredit() } };
  }

  if (method === 'DELETE' && path === '/cart/store-credit') {
    return { data: { cart: repo.removeStoreCredit() } };
  }

  if (method === 'GET' && path === '/addresses') {
    if (empty) {
      return { data: { items: [] } };
    }
    return { data: { items: repo.listAddresses() } };
  }

  if (method === 'POST' && path === '/addresses') {
    return { data: repo.createAddress(body as AddressPayload) };
  }

  if (method === 'PATCH' && /^\/addresses\/[^/]+$/.test(path)) {
    const id = path.split('/')[2] ?? '';
    return { data: repo.updateAddress(id, body as AddressPayload) };
  }

  if (method === 'DELETE' && /^\/addresses\/[^/]+$/.test(path)) {
    repo.deleteAddress(path.split('/')[2] ?? '');
    return { data: {} };
  }

  if (method === 'POST' && path === '/fulfilment/serviceability') {
    if (getUiTestScenario() === 'SERVICEABILITY_FAILED') {
      return {
        data: { serviceable: false, message: 'Delivery is not available to this location.' },
      };
    }
    const lat = asNumber(body.lat) ?? 0;
    const lng = asNumber(body.lng) ?? 0;
    const serviceable = isServiceablePoint(lat, lng);
    return {
      data: {
        serviceable,
        feePaise: serviceable ? 4900 : undefined,
        message: serviceable ? undefined : 'Delivery is not available to this location.',
      },
    };
  }

  if (method === 'GET' && path === '/fulfilment/slots') {
    if (empty) {
      return {
        data: {
          date: params.date,
          fulfilmentType: params.fulfilmentType,
          asapAvailable: false,
          slots: [],
        },
      };
    }
    const date = params.date ?? '2026-08-15';
    const fulfilmentType = (params.fulfilmentType ?? 'DELIVERY') as FulfilmentType;
    return {
      data: {
        date,
        fulfilmentType,
        asapAvailable: true,
        slots: repo.slotsFor(date, fulfilmentType),
        availableDates: [date],
      },
    };
  }

  if (method === 'GET' && path === '/fulfilment/pickup-info') {
    return { data: PICKUP_INFO };
  }

  if (method === 'GET' && path === '/store-credit') {
    const store = repo.requireStore();
    if (empty) {
      return { data: { balancePaise: 0, history: [] } };
    }
    return { data: store?.storeCredit ?? { balancePaise: 0 } };
  }

  if (method === 'POST' && path === '/checkout') {
    const payload: CheckoutPayload = {
      idempotencyKey: asString(body.idempotencyKey) ?? '',
      fulfilment: (asString(body.fulfilment) as FulfilmentType) ?? 'DELIVERY',
      asap: Boolean(body.asap),
      addressId: asString(body.addressId),
      slotId: asString(body.slotId),
      coupon: asString(body.coupon),
      storeCredit: body.storeCredit ? { max: true } : undefined,
    };
    const draft = repo.createCheckout(payload);
    return {
      data: {
        checkoutId: draft.checkoutId,
        amountPaise: draft.amountPaise,
        currency: 'INR',
        razorpayOrderId: draft.razorpayOrderId,
        keyId: UI_TEST_RAZORPAY_KEY,
      },
    };
  }

  if (method === 'POST' && path === '/payments/razorpay/initiate') {
    const scenario = getUiTestScenario();
    if (scenario === 'PAYMENT_FAILED') {
      return httpError(422, 'PAYMENT_FAILED', 'Payment failed. Please try again.');
    }
    const draft = repo.getCheckout();
    if (!draft) {
      return httpError(
        422,
        'CHECKOUT_INVALID',
        'Please review your checkout details and try again.',
      );
    }
    return {
      data: {
        checkoutId: draft.checkoutId,
        razorpayOrderId: draft.razorpayOrderId,
        keyId: UI_TEST_RAZORPAY_KEY,
        amountPaise: draft.amountPaise,
        currency: 'INR',
      },
    };
  }

  if (method === 'POST' && path === '/payments/razorpay/confirm') {
    const scenario = getUiTestScenario();
    if (scenario === 'PAYMENT_VERIFICATION_FAILED') {
      return httpError(422, 'PAYMENT_VERIFICATION_FAILED', 'Payment could not be confirmed.');
    }
    if (scenario === 'PAYMENT_UNKNOWN') {
      return { data: { verified: false, message: 'Payment could not be confirmed.' } };
    }
    const confirmed = repo.confirmPayment();
    const store = repo.requireStore();
    return {
      data: {
        verified: true,
        orderId: confirmed.orderId,
        orderNumber: confirmed.orderNumber,
        totalPaise: confirmed.totalPaise,
        fulfilment: store?.orders[0]?.fulfilment,
        locationLabel: store?.orders[0]?.locationLabel,
        scheduleLabel: store?.orders[0]?.scheduleLabel,
        paymentStatus: 'paid',
      },
    };
  }

  if (method === 'GET' && path === '/orders') {
    const group = (params.statusGroup ?? 'active') as OrderStatusGroup;
    const items = empty ? [] : repo.listOrders(group);
    return { data: paginate(items, params.page) };
  }

  if (method === 'GET' && /^\/orders\/[^/]+\/cancellation-eligibility$/.test(path)) {
    const orderId = path.split('/')[2] ?? '';
    const order = repo.getOrder(orderId);
    return {
      data: {
        allowed: Boolean(order?.canCancel),
        refundPaise: order?.totals.totalPaise,
        message: order?.canCancel ? undefined : 'This order can no longer be cancelled.',
        policyLabel: 'UI-test cancellation policy',
      },
    };
  }

  if (method === 'POST' && /^\/orders\/[^/]+\/cancel$/.test(path)) {
    const orderId = path.split('/')[2] ?? '';
    const result = repo.cancelOrder(orderId);
    return { data: { success: true, refundPaise: result.refundPaise, refundStatus: 'processed' } };
  }

  if (method === 'POST' && /^\/orders\/[^/]+\/reorder$/.test(path)) {
    repo.reorderOrder(path.split('/')[2] ?? '');
    return { data: { success: true, cartUpdated: true, changes: [] } };
  }

  if (method === 'GET' && /^\/orders\/[^/]+\/invoice$/.test(path)) {
    return {
      data: {
        available: true,
        url: 'https://example.com/ui-test-invoice.pdf',
      },
    };
  }

  if (method === 'GET' && /^\/orders\/[^/]+\/reviewable-items$/.test(path)) {
    const items = empty ? [] : repo.reviewableItems(path.split('/')[2] ?? '');
    return { data: { items } };
  }

  if (method === 'GET' && /^\/orders\/[^/]+\/tracking$/.test(path)) {
    return { data: repo.trackingFor(path.split('/')[2] ?? '') };
  }

  if (method === 'GET' && /^\/orders\/[^/]+\/rider$/.test(path)) {
    return { data: repo.riderFor(path.split('/')[2] ?? '') };
  }

  if (method === 'GET' && /^\/orders\/[^/]+\/rider-chat\/messages$/.test(path)) {
    const orderId = path.split('/')[2] ?? '';
    const items = empty ? [] : repo.chatFor(orderId);
    return { data: { ...paginate(items, params.page), available: true } };
  }

  if (method === 'POST' && /^\/orders\/[^/]+\/rider-chat\/messages$/.test(path)) {
    const orderId = path.split('/')[2] ?? '';
    return { data: repo.sendChat(orderId, asString(body.text) ?? '') };
  }

  if (method === 'GET' && /^\/orders\/[^/]+$/.test(path)) {
    const order = repo.getOrder(path.split('/')[2] ?? '');
    if (!order) {
      return httpError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }
    return { data: { order } };
  }

  if (method === 'POST' && path === '/reviews') {
    const created = repo.addReview(
      asString(body.orderItemId) ?? '',
      asNumber(body.rating) ?? 5,
      asString(body.text) ?? '',
    );
    return { data: { id: created.id, status: 'submitted' } };
  }

  if (method === 'POST' && path === '/devices/push-token') {
    return { data: { ok: true } };
  }

  if (method === 'GET' && path === '/notifications') {
    const items = empty ? [] : repo.notifications();
    return { data: paginate(items, params.page) };
  }

  if (method === 'POST' && /^\/notifications\/[^/]+\/read$/.test(path)) {
    repo.markNotificationRead(path.split('/')[2] ?? '');
    return { data: { ok: true } };
  }

  if (method === 'GET' && path === '/support/tickets') {
    const items = empty ? [] : repo.tickets();
    return { data: paginate(items, params.page) };
  }

  if (method === 'POST' && path === '/support/tickets') {
    const ticket = repo.createTicket(asString(body.message) ?? '', asString(body.orderId));
    return { data: { success: true, ticketId: ticket.id } };
  }

  if (
    method === 'GET' &&
    /^\/support\/tickets\/[^/]+$/.test(path) &&
    !path.endsWith('/messages') &&
    !path.endsWith('/attachments')
  ) {
    const ticket = repo.getTicket(path.split('/')[3] ?? '');
    if (!ticket) {
      return httpError(404, 'TICKET_NOT_FOUND', 'Ticket not found');
    }
    return { data: { ticket } };
  }

  if (method === 'POST' && /^\/support\/tickets\/[^/]+\/messages$/.test(path)) {
    repo.replyTicket(path.split('/')[3] ?? '', asString(body.message) ?? '');
    return { data: { ok: true } };
  }

  if (method === 'POST' && /^\/support\/tickets\/[^/]+\/attachments$/.test(path)) {
    return { data: { ok: true } };
  }

  return httpError(404, 'NOT_FOUND', 'We could not find what you were looking for.');
}

function sortProducts<T extends { pricePaise: number; name: string }>(
  items: T[],
  sort: string | undefined,
): T[] {
  const copy = [...items];
  if (sort === 'price_asc') {
    copy.sort((a, b) => a.pricePaise - b.pricePaise);
  } else if (sort === 'price_desc') {
    copy.sort((a, b) => b.pricePaise - a.pricePaise);
  } else if (sort === 'newest') {
    copy.reverse();
  }
  return copy;
}
