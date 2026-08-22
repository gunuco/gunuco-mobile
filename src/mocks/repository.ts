import type { Address, AddressPayload } from '@/src/types/address';
import type { Customer } from '@/src/types/auth';
import type { Cart, CartLine } from '@/src/types/cart';
import type { CheckoutPayload } from '@/src/types/checkout';
import type { FulfilmentSlot } from '@/src/types/fulfilment';
import type { CustomerNotification } from '@/src/types/notification';
import type { OrderDetail, OrderItem, OrderListItem, OrderStatusGroup } from '@/src/types/order';
import type { AddCartItemPayload } from '@/src/types/product';
import type { ProductReview, ReviewableItem } from '@/src/types/review';
import type { RiderChatMessage } from '@/src/types/riderChat';
import type { StoreCredit } from '@/src/types/storeCredit';
import type { SupportTicketDetail, SupportTicketSummary } from '@/src/types/support';
import type { OrderRider, OrderTracking } from '@/src/types/tracking';
import {
    COUPON_CODE,
    DEFAULT_ADDRESS_A,
    DEFAULT_ADDRESS_B,
    DELIVERY_FEE_PAISE,
    OFFICE_ADDRESS_A,
    OTHER_ADDRESS_A,
    TAX_BPS,
    allProducts,
    findProduct,
    seedReviews,
} from './fixtures';
import { UI_TEST_CUSTOMERS, type UiTestCustomerId, customerIdFromToken } from './scenarios';

export type CheckoutDraft = {
  checkoutId: string;
  amountPaise: number;
  razorpayOrderId: string;
  fulfilment: 'DELIVERY' | 'PICKUP';
  addressId?: string;
  slotId?: string;
  asap: boolean;
};

type CustomerStore = {
  customer: Customer;
  wishlistIds: string[];
  cart: Cart;
  addresses: Address[];
  orders: OrderDetail[];
  notifications: CustomerNotification[];
  tickets: SupportTicketDetail[];
  storeCredit: StoreCredit;
  chat: Record<string, RiderChatMessage[]>;
  reviews: Record<string, ProductReview[]>;
  checkout: CheckoutDraft | null;
  lastOtpChallenge: string | null;
  lastPhoneChangeChallenge: string | null;
  pendingPhone?: string;
};

let currentCustomerId: UiTestCustomerId | null = null;
const stores: Record<UiTestCustomerId, CustomerStore> = {
  'ui-test-customer-a': createStore('ui-test-customer-a'),
  'ui-test-customer-b': createStore('ui-test-customer-b'),
};

function nowIso(): string {
  return new Date().toISOString();
}

function emptyCart(id: string): Cart {
  return {
    id,
    items: [],
    totals: {
      subtotalPaise: 0,
      discountPaise: 0,
      storeCreditPaise: 0,
      taxPaise: 0,
      deliveryFeePaise: 0,
      totalPaise: 0,
    },
    coupon: null,
    storeCreditApplied: false,
    itemCount: 0,
    totalQuantity: 0,
    isValid: true,
    canCheckout: false,
    checkoutBlocked: false,
    changes: [],
  };
}

function createStore(id: UiTestCustomerId): CustomerStore {
  const profile = UI_TEST_CUSTOMERS[id];
  const customer: Customer = {
    customerId: profile.customerId,
    phone: profile.phone,
    name: profile.name,
    email: profile.email,
    status: 'active',
  };
  const addresses =
    id === 'ui-test-customer-a'
      ? [DEFAULT_ADDRESS_A, OFFICE_ADDRESS_A, OTHER_ADDRESS_A]
      : [DEFAULT_ADDRESS_B];
  const wishlistIds =
    id === 'ui-test-customer-a'
      ? [
          'prd-choco-truffle',
          'prd-red-velvet',
          'prd-biscoff-cheesecake',
          'prd-brownie-choco',
          'prd-cookie-choco',
          'prd-unavailable',
        ]
      : [];
  const storeCredit: StoreCredit =
    id === 'ui-test-customer-a'
      ? {
          balancePaise: 25000,
          history: [
            {
              id: 'sc-a-1',
              label: 'Refund — cancelled test order',
              amountPaise: 25000,
              createdAtLabel: '1 Aug 2026',
            },
          ],
        }
      : { balancePaise: 0, history: [] };

  const store: CustomerStore = {
    customer,
    wishlistIds,
    cart: emptyCart(`cart-${id}`),
    addresses,
    orders: [],
    notifications: [],
    tickets: [],
    storeCredit,
    chat: {},
    reviews: {},
    checkout: null,
    lastOtpChallenge: null,
    lastPhoneChangeChallenge: null,
  };
  store.orders = seedOrders(id);
  store.notifications = seedNotifications(id);
  store.tickets = seedTickets(id);
  store.chat['ord-a-ofd'] = seedChat();
  allProducts().forEach((product) => {
    store.reviews[product.id] = seedReviews(product.id);
  });
  return store;
}

function seedChat(): RiderChatMessage[] {
  return [
    {
      id: 'chat-1',
      sender: 'SYSTEM',
      text: 'Your order is out for delivery.',
      createdAt: nowIso(),
      createdAtLabel: 'Today',
    },
    {
      id: 'chat-2',
      sender: 'RIDER',
      text: 'I am 10 minutes away.',
      createdAt: nowIso(),
      createdAtLabel: 'Today',
    },
  ];
}

function lineFromProduct(productId: string, lineId: string): OrderItem {
  const product = findProduct(productId);
  return {
    id: lineId,
    productId,
    name: product?.name ?? 'Cake',
    imageUrl: product?.imageUrl,
    quantity: 1,
    unitPricePaise: product?.pricePaise,
    lineTotalPaise: product?.pricePaise,
    optionsSummary: product?.hasRequiredOptions ? '500 g · Chocolate' : undefined,
    reviewEligible: false,
  };
}

function seedOrders(id: UiTestCustomerId): OrderDetail[] {
  if (id === 'ui-test-customer-b') {
    return [
      {
        id: 'ord-b-delivered',
        orderNumber: 'GUN-B-1001',
        status: 'DELIVERED',
        statusLabel: 'Delivered',
        presentationStatus: 'DELIVERED',
        statusGroup: 'past',
        placedAt: '2026-07-01T09:00:00.000Z',
        placedAtLabel: '1 Jul 2026',
        paymentStatus: 'paid',
        fulfilment: 'DELIVERY',
        locationLabel: 'Banjara Hills',
        items: [
          {
            ...lineFromProduct('prd-cookie-choco', 'oi-b-1'),
            reviewEligible: true,
          },
        ],
        totals: { subtotalPaise: 24900, totalPaise: 29800, taxPaise: 1200, deliveryFeePaise: 4900 },
        timeline: [
          { status: 'CONFIRMED', statusLabel: 'Confirmed', presentationStatus: 'CONFIRMED' },
          {
            status: 'DELIVERED',
            statusLabel: 'Delivered',
            presentationStatus: 'DELIVERED',
            current: true,
          },
        ],
        canReorder: true,
        invoiceAvailable: true,
        complaintAllowed: true,
        chatAvailable: true,
      },
    ];
  }

  const chocolate = lineFromProduct('prd-choco-truffle', 'oi-a-choco');
  return [
    {
      id: 'ord-a-placed',
      orderNumber: 'GUN-A-1001',
      status: 'PLACED',
      statusLabel: 'Confirmed',
      presentationStatus: 'CONFIRMED',
      statusGroup: 'active',
      placedAt: nowIso(),
      placedAtLabel: 'Today',
      paymentStatus: 'paid',
      fulfilment: 'DELIVERY',
      locationLabel: 'HITEC City',
      scheduleLabel: 'ASAP',
      items: [chocolate],
      totals: { subtotalPaise: 69900, totalPaise: 78295, taxPaise: 3495, deliveryFeePaise: 4900 },
      timeline: [
        {
          status: 'PLACED',
          statusLabel: 'Confirmed',
          presentationStatus: 'CONFIRMED',
          current: true,
        },
      ],
      canCancel: true,
      trackingAvailable: false,
      invoiceAvailable: false,
      complaintAllowed: false,
    },
    {
      id: 'ord-a-preparing',
      orderNumber: 'GUN-A-1002',
      status: 'PREPARING',
      statusLabel: 'Preparing',
      presentationStatus: 'PREPARING',
      statusGroup: 'active',
      placedAt: nowIso(),
      paymentStatus: 'paid',
      fulfilment: 'DELIVERY',
      locationLabel: 'HITEC City',
      items: [lineFromProduct('prd-red-velvet', 'oi-a-rv')],
      totals: { subtotalPaise: 74900, totalPaise: 83545 },
      timeline: [
        { status: 'CONFIRMED', statusLabel: 'Confirmed', presentationStatus: 'CONFIRMED' },
        {
          status: 'PREPARING',
          statusLabel: 'Preparing',
          presentationStatus: 'PREPARING',
          current: true,
        },
      ],
      canCancel: true,
    },
    {
      id: 'ord-a-ready',
      orderNumber: 'GUN-A-1003',
      status: 'READY',
      statusLabel: 'Ready',
      presentationStatus: 'READY',
      statusGroup: 'active',
      placedAt: nowIso(),
      paymentStatus: 'paid',
      fulfilment: 'PICKUP',
      pickupName: 'GUNUCO Bakery — HITEC City',
      pickupAddress: 'Plot 12, HITEC City, Hyderabad 500081',
      items: [lineFromProduct('prd-opera', 'oi-a-opera')],
      totals: { subtotalPaise: 39900, totalPaise: 41895 },
      timeline: [
        { status: 'PREPARING', statusLabel: 'Preparing', presentationStatus: 'PREPARING' },
        { status: 'READY', statusLabel: 'Ready', presentationStatus: 'READY', current: true },
      ],
    },
    {
      id: 'ord-a-ofd',
      orderNumber: 'GUN-A-1004',
      status: 'OUT_FOR_DELIVERY',
      statusLabel: 'Out for delivery',
      presentationStatus: 'OUT_FOR_DELIVERY',
      statusGroup: 'active',
      placedAt: nowIso(),
      paymentStatus: 'paid',
      fulfilment: 'DELIVERY',
      locationLabel: 'HITEC City',
      items: [lineFromProduct('prd-black-forest', 'oi-a-bf')],
      totals: { subtotalPaise: 64900, totalPaise: 73045 },
      timeline: [
        { status: 'READY', statusLabel: 'Ready', presentationStatus: 'READY' },
        {
          status: 'OUT_FOR_DELIVERY',
          statusLabel: 'Out for delivery',
          presentationStatus: 'OUT_FOR_DELIVERY',
          current: true,
        },
      ],
      trackingAvailable: true,
      riderAvailable: true,
      chatAvailable: true,
      callAvailable: true,
    },
    {
      id: 'ord-a-delivered',
      orderNumber: 'GUN-A-1005',
      status: 'DELIVERED',
      statusLabel: 'Delivered',
      presentationStatus: 'DELIVERED',
      statusGroup: 'past',
      placedAt: '2026-07-20T12:00:00.000Z',
      placedAtLabel: '20 Jul 2026',
      paymentStatus: 'paid',
      fulfilment: 'DELIVERY',
      locationLabel: 'HITEC City',
      items: [{ ...lineFromProduct('prd-butterscotch', 'oi-a-butter'), reviewEligible: true }],
      totals: {
        subtotalPaise: 59900,
        taxPaise: 1200,
        deliveryFeePaise: 4900,
        storeCreditPaise: 2500,
        totalPaise: 63400,
      },
      timeline: [
        {
          status: 'DELIVERED',
          statusLabel: 'Delivered',
          presentationStatus: 'DELIVERED',
          current: true,
        },
      ],
      canReorder: true,
      invoiceAvailable: true,
      complaintAllowed: true,
      chatAvailable: true,
      refundPaise: 26400,
      refundStatus: 'processed',
    },
    {
      id: 'ord-a-cancelled',
      orderNumber: 'GUN-A-1006',
      status: 'CANCELLED',
      statusLabel: 'Cancelled',
      presentationStatus: 'CANCELLED',
      statusGroup: 'cancelled',
      placedAt: '2026-07-10T12:00:00.000Z',
      paymentStatus: 'refunded',
      fulfilment: 'DELIVERY',
      locationLabel: 'HITEC City',
      items: [lineFromProduct('prd-pineapple', 'oi-a-pine')],
      totals: { subtotalPaise: 54900, totalPaise: 0, discountPaise: 54900 },
      timeline: [
        {
          status: 'CANCELLED',
          statusLabel: 'Cancelled',
          presentationStatus: 'CANCELLED',
          current: true,
        },
      ],
      refundPaise: 59800,
      refundStatus: 'processed',
      canReorder: true,
      chatAvailable: true,
    },
  ];
}

function seedNotifications(id: UiTestCustomerId): CustomerNotification[] {
  const orderId = id === 'ui-test-customer-a' ? 'ord-a-ofd' : 'ord-b-delivered';
  const ticketId = id === 'ui-test-customer-a' ? 'tkt-a-open' : 'tkt-b-closed';
  const reviewItem = id === 'ui-test-customer-a' ? 'oi-a-butter' : 'oi-b-1';
  const productId = id === 'ui-test-customer-a' ? 'prd-butterscotch' : 'prd-cookie-choco';
  return [
    {
      id: `ntf-${id}-confirmed`,
      title: 'Order confirmed',
      body: 'Your GUNUCO order is confirmed.',
      createdAt: nowIso(),
      read: false,
      type: 'ORDER_CONFIRMED',
      deepLink: { kind: 'order', orderId },
    },
    {
      id: `ntf-${id}-pay`,
      title: 'Payment received',
      body: 'Payment was verified.',
      createdAt: nowIso(),
      read: false,
      type: 'PAYMENT_SUCCESS',
      deepLink: { kind: 'order', orderId },
    },
    {
      id: `ntf-${id}-prep`,
      title: 'Preparing your order',
      body: 'The bakery has started preparing your order.',
      createdAt: nowIso(),
      read: true,
      type: 'ORDER_PREPARING',
      deepLink: { kind: 'order', orderId },
    },
    {
      id: `ntf-${id}-ready`,
      title: 'Order ready',
      body: 'Your order is ready.',
      createdAt: nowIso(),
      read: true,
      type: 'ORDER_READY',
      deepLink: { kind: 'order', orderId },
    },
    {
      id: `ntf-${id}-ofd`,
      title: 'Out for delivery',
      body: 'Your order is on the way.',
      createdAt: nowIso(),
      read: false,
      type: 'OUT_FOR_DELIVERY',
      deepLink: { kind: 'tracking', orderId },
    },
    {
      id: `ntf-${id}-delivered`,
      title: 'Delivered',
      body: 'Your order was delivered.',
      createdAt: nowIso(),
      read: true,
      type: 'DELIVERED',
      deepLink: { kind: 'order', orderId },
    },
    {
      id: `ntf-${id}-support`,
      title: 'Support update',
      body: 'GUNUCO replied to your ticket.',
      createdAt: nowIso(),
      read: false,
      type: 'SUPPORT_UPDATE',
      deepLink: { kind: 'ticket', ticketId },
    },
    {
      id: `ntf-${id}-review`,
      title: 'Review your order',
      body: 'Tell us how your cake was.',
      createdAt: nowIso(),
      read: false,
      type: 'REVIEW_REMINDER',
      deepLink: { kind: 'review', orderItemId: reviewItem, productId },
    },
    {
      id: `ntf-${id}-unknown`,
      title: 'GUNUCO update',
      body: 'A message with an unknown destination stays in the inbox.',
      createdAt: nowIso(),
      read: false,
      type: 'UNKNOWN_TYPE',
    },
  ];
}

function seedTickets(id: UiTestCustomerId): SupportTicketDetail[] {
  if (id === 'ui-test-customer-b') {
    return [
      {
        id: 'tkt-b-closed',
        displayId: 'SUP-B-1',
        status: 'CLOSED',
        statusLabel: 'Closed',
        preview: 'Cookie box arrived late.',
        orderId: 'ord-b-delivered',
        replyAllowed: false,
        messages: [
          {
            id: 'tm-b-1',
            actor: 'customer',
            body: 'Cookie box arrived late.',
            createdAt: nowIso(),
          },
          {
            id: 'tm-b-2',
            actor: 'support',
            body: 'Sorry about the delay. This ticket is closed.',
            createdAt: nowIso(),
          },
        ],
      },
    ];
  }
  return [
    {
      id: 'tkt-a-open',
      displayId: 'SUP-A-1',
      status: 'OPEN',
      statusLabel: 'Open',
      preview: 'Need the bill for my last order.',
      orderId: 'ord-a-delivered',
      replyAllowed: true,
      messages: [
        {
          id: 'tm-a-1',
          actor: 'customer',
          body: 'Need the bill for my last order.',
          createdAt: nowIso(),
        },
        {
          id: 'tm-a-2',
          actor: 'support',
          body: 'We will share the invoice shortly.',
          createdAt: nowIso(),
        },
      ],
    },
  ];
}

export function getCurrentCustomerId(): UiTestCustomerId | null {
  return currentCustomerId;
}

export function setCurrentCustomerId(id: UiTestCustomerId | null): void {
  currentCustomerId = id;
}

export function setCurrentCustomerFromToken(token: string | undefined): void {
  const id = customerIdFromToken(token);
  if (id) {
    currentCustomerId = id;
  }
}

export function requireStore(): CustomerStore | null {
  if (!currentCustomerId) {
    return null;
  }
  return stores[currentCustomerId];
}

export function storeFor(id: UiTestCustomerId): CustomerStore {
  return stores[id];
}

function recalcCart(store: CustomerStore): Cart {
  const items = store.cart.items.map((item) => ({
    ...item,
    lineTotalPaise: item.unitPricePaise * item.quantity,
  }));
  const subtotalPaise = items.reduce((sum, item) => sum + (item.lineTotalPaise ?? 0), 0);
  const discountPaise =
    store.cart.coupon?.code === COUPON_CODE ? Math.round(subtotalPaise * 0.1) : 0;
  const afterDiscount = Math.max(0, subtotalPaise - discountPaise);
  const taxPaise = Math.round((afterDiscount * TAX_BPS) / 10000);
  const deliveryFeePaise = items.length > 0 ? DELIVERY_FEE_PAISE : 0;
  const creditCap = store.storeCredit.balancePaise;
  const storeCreditPaise = store.cart.storeCreditApplied
    ? Math.min(creditCap, afterDiscount + taxPaise + deliveryFeePaise)
    : 0;
  const totalPaise = Math.max(0, afterDiscount + taxPaise + deliveryFeePaise - storeCreditPaise);
  const unavailable = items.some((item) => item.isAvailable === false);
  store.cart = {
    ...store.cart,
    items,
    totals: {
      subtotalPaise,
      discountPaise,
      storeCreditPaise,
      taxPaise,
      deliveryFeePaise,
      totalPaise,
    },
    itemCount: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    isValid: !unavailable && items.length > 0,
    canCheckout: !unavailable && items.length > 0,
    checkoutBlocked: unavailable,
    checkoutBlockedReason: unavailable ? 'An item in your cart is unavailable.' : null,
  };
  return store.cart;
}

export function getCart(): Cart | null {
  const store = requireStore();
  if (!store) {
    return null;
  }
  return recalcCart(store);
}

export function addCartItem(payload: AddCartItemPayload): { itemId: string; cartId: string } {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  const product = findProduct(payload.productId);
  if (!product || product.isAvailable === false) {
    throw new Error('PRODUCT_UNAVAILABLE');
  }
  const optionSummary = payload.options
    .flatMap((group) => group.valueIds)
    .map((valueId) => {
      const match = product.optionGroups
        ?.flatMap((group) => group.options)
        .find((option) => option.id === valueId);
      return match?.label;
    })
    .filter((label): label is string => Boolean(label))
    .join(' · ');
  const extra = payload.options.reduce((sum, group) => {
    const optionGroup = product.optionGroups?.find((item) => item.id === group.groupId);
    const prices = group.valueIds.map((valueId) => {
      const option = optionGroup?.options.find((item) => item.id === valueId);
      return option?.pricePaise ?? 0;
    });
    return sum + prices.reduce((a, b) => a + b, 0);
  }, 0);
  const unitPricePaise = product.pricePaise + extra;
  const lineId = `line-${Date.now()}`;
  const line: CartLine = {
    id: lineId,
    productId: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    quantity: payload.quantity,
    quantityMin: 1,
    quantityMax: 5,
    unitPricePaise,
    lineTotalPaise: unitPricePaise * payload.quantity,
    optionsSummary: optionSummary || undefined,
    selectedOptions: payload.options.map((group) => {
      const optionGroup = product.optionGroups?.find((item) => item.id === group.groupId);
      return {
        groupId: group.groupId,
        groupLabel: optionGroup?.label,
        valueIds: group.valueIds,
        valueLabels: group.valueIds.map(
          (valueId) => optionGroup?.options.find((item) => item.id === valueId)?.label ?? valueId,
        ),
      };
    }),
    isAvailable: true,
  };
  store.cart.items = [...store.cart.items, line];
  recalcCart(store);
  return { itemId: lineId, cartId: store.cart.id ?? `cart-${store.customer.customerId}` };
}

export function updateCartQty(itemId: string, quantity: number): Cart {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  store.cart.items = store.cart.items.map((item) =>
    item.id === itemId ? { ...item, quantity } : item,
  );
  return recalcCart(store);
}

export function removeCartItem(itemId: string): Cart {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  store.cart.items = store.cart.items.filter((item) => item.id !== itemId);
  return recalcCart(store);
}

export function revalidateCart(): Cart {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  store.cart.changes = [];
  return recalcCart(store);
}

export function applyCoupon(code: string): Cart {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  const normalized = code.trim().toUpperCase();
  if (normalized !== COUPON_CODE) {
    throw new Error('COUPON_INVALID');
  }
  store.cart.coupon = { code: COUPON_CODE, label: '10% off' };
  return recalcCart(store);
}

export function removeCoupon(): Cart {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  store.cart.coupon = null;
  return recalcCart(store);
}

export function applyStoreCredit(): Cart {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  if (store.storeCredit.balancePaise <= 0) {
    throw new Error('STORE_CREDIT_INSUFFICIENT');
  }
  store.cart.storeCreditApplied = true;
  return recalcCart(store);
}

export function removeStoreCredit(): Cart {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  store.cart.storeCreditApplied = false;
  return recalcCart(store);
}

export function wishlistIds(): string[] {
  return requireStore()?.wishlistIds ?? [];
}

export function addWishlist(productId: string): void {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  if (!store.wishlistIds.includes(productId)) {
    store.wishlistIds = [...store.wishlistIds, productId];
  }
}

export function removeWishlist(productId: string): void {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  store.wishlistIds = store.wishlistIds.filter((id) => id !== productId);
}

export function listAddresses(): Address[] {
  return requireStore()?.addresses ?? [];
}

export function createAddress(payload: AddressPayload): Address {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  const created: Address = { ...payload, id: `addr-${Date.now()}` };
  if (created.isDefault) {
    store.addresses = store.addresses.map((item) => ({ ...item, isDefault: false }));
  }
  store.addresses = [...store.addresses, created];
  return created;
}

export function updateAddress(id: string, payload: AddressPayload): Address {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  const index = store.addresses.findIndex((item) => item.id === id);
  if (index < 0) {
    throw new Error('ADDRESS_NOT_FOUND');
  }
  const updated: Address = { ...store.addresses[index], ...payload, id };
  if (updated.isDefault) {
    store.addresses = store.addresses.map((item) =>
      item.id === id ? updated : { ...item, isDefault: false },
    );
  } else {
    store.addresses[index] = updated;
  }
  return updated;
}

export function deleteAddress(id: string): void {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  store.addresses = store.addresses.filter((item) => item.id !== id);
}

export function updateProfile(name?: string, email?: string | null): Customer {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  if (name !== undefined) {
    store.customer.name = name;
  }
  if (email !== undefined) {
    store.customer.email = email;
  }
  return store.customer;
}

export function setOtpChallenge(challengeId: string): void {
  const store = requireStore();
  if (store) {
    store.lastOtpChallenge = challengeId;
  }
}

export function rememberGuestChallenge(challengeId: string, customerId: UiTestCustomerId): void {
  stores[customerId].lastOtpChallenge = challengeId;
}

export function setPhoneChangeChallenge(challengeId: string, newPhone: string): void {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  store.lastPhoneChangeChallenge = challengeId;
  store.pendingPhone = newPhone;
}

export function applyPhoneChange(): Customer {
  const store = requireStore();
  if (!store || !store.pendingPhone) {
    throw new Error('PHONE_CHANGE_INVALID');
  }
  store.customer.phone = store.pendingPhone;
  store.pendingPhone = undefined;
  store.lastPhoneChangeChallenge = null;
  return store.customer;
}

export function createCheckout(payload: CheckoutPayload): CheckoutDraft {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  const cart = recalcCart(store);
  if (!cart.canCheckout || cart.items.length === 0) {
    throw new Error('CART_INVALID');
  }
  const amountPaise = cart.totals.totalPaise ?? 0;
  const draft: CheckoutDraft = {
    checkoutId: `chk-${Date.now()}`,
    amountPaise,
    razorpayOrderId: `order_ui_${Date.now()}`,
    fulfilment: payload.fulfilment,
    addressId: payload.addressId,
    slotId: payload.slotId,
    asap: payload.asap,
  };
  store.checkout = draft;
  return draft;
}

export function getCheckout(): CheckoutDraft | null {
  return requireStore()?.checkout ?? null;
}

export function confirmPayment(): { orderId: string; orderNumber: string; totalPaise: number } {
  const store = requireStore();
  if (!store || !store.checkout) {
    throw new Error('CHECKOUT_INVALID');
  }
  const cart = recalcCart(store);
  const orderId = `ord-${Date.now()}`;
  const orderNumber = `GUN-${Date.now()}`;
  const items: OrderItem[] = cart.items.map((item) => ({
    id: `oi-${item.id}`,
    productId: item.productId,
    name: item.name,
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    unitPricePaise: item.unitPricePaise,
    lineTotalPaise: item.lineTotalPaise,
    optionsSummary: item.optionsSummary,
  }));
  const order: OrderDetail = {
    id: orderId,
    orderNumber,
    status: 'PLACED',
    statusLabel: 'Confirmed',
    presentationStatus: 'CONFIRMED',
    statusGroup: 'active',
    placedAt: nowIso(),
    placedAtLabel: 'Just now',
    paymentStatus: 'paid',
    fulfilment: store.checkout.fulfilment,
    locationLabel:
      store.checkout.fulfilment === 'PICKUP' ? 'GUNUCO Bakery — HITEC City' : 'HITEC City',
    scheduleLabel: store.checkout.asap ? 'ASAP' : 'Scheduled',
    items,
    totals: cart.totals,
    timeline: [
      {
        status: 'PLACED',
        statusLabel: 'Confirmed',
        presentationStatus: 'CONFIRMED',
        current: true,
      },
    ],
    canCancel: true,
  };
  store.orders = [order, ...store.orders];
  const totalPaise = cart.totals.totalPaise ?? 0;
  store.cart = emptyCart(store.cart.id ?? `cart-${store.customer.customerId}`);
  store.checkout = null;
  return { orderId, orderNumber, totalPaise };
}

function toListItem(order: OrderDetail): OrderListItem {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    statusLabel: order.statusLabel,
    presentationStatus: order.presentationStatus,
    statusGroup: order.statusGroup,
    placedAt: order.placedAt,
    placedAtLabel: order.placedAtLabel,
    fulfilment: order.fulfilment,
    itemSummary: order.items.map((item) => item.name).join(', '),
    itemCount: order.items.length,
    totalPaise: order.totals.totalPaise,
    scheduleLabel: order.scheduleLabel,
    trackingAvailable: order.trackingAvailable,
    riderAvailable: order.riderAvailable,
    canReorder: order.canReorder,
    invoiceAvailable: order.invoiceAvailable,
    refundPaise: order.refundPaise,
    refundStatus: order.refundStatus,
  };
}

export function listOrders(group: OrderStatusGroup): OrderListItem[] {
  const store = requireStore();
  if (!store) {
    return [];
  }
  return store.orders.filter((order) => (order.statusGroup ?? 'active') === group).map(toListItem);
}

export function getOrder(orderId: string): OrderDetail | undefined {
  return requireStore()?.orders.find((order) => order.id === orderId);
}

export function cancelOrder(orderId: string): { refundPaise: number } {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  const order = store.orders.find((item) => item.id === orderId);
  if (!order) {
    throw new Error('ORDER_NOT_FOUND');
  }
  if (!order.canCancel) {
    throw new Error('CANCELLATION_NOT_ALLOWED');
  }
  const refundPaise = order.totals.totalPaise ?? 0;
  order.status = 'CANCELLED';
  order.statusLabel = 'Cancelled';
  order.presentationStatus = 'CANCELLED';
  order.statusGroup = 'cancelled';
  order.canCancel = false;
  order.refundPaise = refundPaise;
  order.refundStatus = 'processed';
  return { refundPaise };
}

export function reorderOrder(orderId: string): void {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  const order = store.orders.find((item) => item.id === orderId);
  if (!order) {
    throw new Error('ORDER_NOT_FOUND');
  }
  order.items.forEach((item) => {
    if (item.productId) {
      addCartItem({ productId: item.productId, quantity: item.quantity, options: [] });
    }
  });
}

export function trackingFor(orderId: string): OrderTracking {
  const order = getOrder(orderId);
  if (!order || order.presentationStatus === 'CANCELLED') {
    return { available: false, cancelled: order?.presentationStatus === 'CANCELLED' };
  }
  if (order.presentationStatus === 'DELIVERED') {
    return {
      available: false,
      delivered: true,
      status: 'DELIVERED',
      statusLabel: 'Delivered',
    };
  }
  if (order.presentationStatus !== 'OUT_FOR_DELIVERY') {
    return {
      available: false,
      status: order.status,
      statusLabel: order.statusLabel,
      message: 'Live tracking starts when the order is out for delivery.',
    };
  }
  return {
    available: true,
    status: 'OUT_FOR_DELIVERY',
    statusLabel: 'Out for delivery',
    etaLabel: '12 min',
    riderLat: 17.452,
    riderLng: 78.385,
    destinationLat: 17.4486,
    destinationLng: 78.3908,
    polyline: [
      { lat: 17.452, lng: 78.385 },
      { lat: 17.45, lng: 78.388 },
      { lat: 17.4486, lng: 78.3908 },
    ],
    updatedAt: nowIso(),
  };
}

export function riderFor(orderId: string): OrderRider {
  const order = getOrder(orderId);
  if (!order?.riderAvailable && order?.presentationStatus !== 'OUT_FOR_DELIVERY') {
    return { message: 'Rider details are not available yet.' };
  }
  return {
    displayName: 'Ravi',
    rating: 4.8,
    callAllowed: true,
    chatAllowed: true,
    callNumber: '9000000088',
  };
}

export function chatFor(orderId: string): RiderChatMessage[] {
  const store = requireStore();
  if (!store) {
    return [];
  }
  return store.chat[orderId] ?? [];
}

export function sendChat(orderId: string, text: string): RiderChatMessage {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  const message: RiderChatMessage = {
    id: `chat-${Date.now()}`,
    sender: 'CUSTOMER',
    text,
    createdAt: nowIso(),
    createdAtLabel: 'Now',
  };
  store.chat[orderId] = [...(store.chat[orderId] ?? []), message];
  return message;
}

export function notifications(): CustomerNotification[] {
  return requireStore()?.notifications ?? [];
}

export function markNotificationRead(id: string): void {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  store.notifications = store.notifications.map((item) =>
    item.id === id ? { ...item, read: true } : item,
  );
}

export function unreadCount(): number {
  return notifications().filter((item) => !item.read).length;
}

export function tickets(): SupportTicketSummary[] {
  return (requireStore()?.tickets ?? []).map((ticket) => ({
    id: ticket.id,
    displayId: ticket.displayId,
    status: ticket.status,
    statusLabel: ticket.statusLabel,
    preview: ticket.preview,
    orderId: ticket.orderId,
    createdAt: ticket.createdAt,
  }));
}

export function getTicket(id: string): SupportTicketDetail | undefined {
  return requireStore()?.tickets.find((ticket) => ticket.id === id);
}

export function createTicket(message: string, orderId?: string): SupportTicketDetail {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  const ticket: SupportTicketDetail = {
    id: `tkt-${Date.now()}`,
    displayId: `SUP-${Date.now()}`,
    status: 'NEW',
    statusLabel: 'New',
    preview: message,
    orderId,
    replyAllowed: true,
    messages: [{ id: `tm-${Date.now()}`, actor: 'customer', body: message, createdAt: nowIso() }],
  };
  store.tickets = [ticket, ...store.tickets];
  return ticket;
}

export function replyTicket(id: string, message: string): void {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  const ticket = store.tickets.find((item) => item.id === id);
  if (!ticket) {
    throw new Error('TICKET_NOT_FOUND');
  }
  if (!ticket.replyAllowed) {
    throw new Error('REPLY_NOT_ALLOWED');
  }
  ticket.messages = [
    ...ticket.messages,
    { id: `tm-${Date.now()}`, actor: 'customer', body: message, createdAt: nowIso() },
  ];
  ticket.preview = message;
  ticket.status = 'OPEN';
  ticket.statusLabel = 'Open';
}

export function reviewsFor(productId: string): ProductReview[] {
  const store = requireStore();
  if (store?.reviews[productId]) {
    return store.reviews[productId];
  }
  return seedReviews(productId);
}

export function addReview(orderItemId: string, rating: number, text: string): { id: string } {
  const store = requireStore();
  if (!store) {
    throw new Error('UNAUTHENTICATED');
  }
  const order = store.orders.find((item) => item.items.some((line) => line.id === orderItemId));
  const line = order?.items.find((item) => item.id === orderItemId);
  if (!line?.productId) {
    throw new Error('REVIEW_NOT_ELIGIBLE');
  }
  const review: ProductReview = {
    id: `rev-${Date.now()}`,
    rating,
    text,
    createdAt: nowIso(),
    createdAtLabel: 'Just now',
    reviewerDisplayName: 'You',
  };
  store.reviews[line.productId] = [review, ...(store.reviews[line.productId] ?? [])];
  line.reviewEligible = false;
  line.reviewStatus = 'submitted';
  return { id: review.id };
}

export function reviewableItems(orderId: string): ReviewableItem[] {
  const order = getOrder(orderId);
  if (!order) {
    return [];
  }
  return order.items
    .filter((item) => item.reviewEligible)
    .map((item) => ({
      orderItemId: item.id,
      productId: item.productId,
      productName: item.name,
    }));
}

export function slotsFor(date: string, fulfilmentType: string): FulfilmentSlot[] {
  if (fulfilmentType === 'PICKUP') {
    return [
      { id: `slot-p-1-${date}`, label: '11:00 AM – 1:00 PM', available: true },
      { id: `slot-p-2-${date}`, label: '4:00 PM – 6:00 PM', available: true },
    ];
  }
  return [
    { id: `slot-d-1-${date}`, label: '5:00 PM – 7:00 PM', available: true },
    { id: `slot-d-2-${date}`, label: '7:00 PM – 9:00 PM', available: true },
    { id: `slot-d-3-${date}`, label: '9:00 PM – 10:00 PM', available: false },
  ];
}

export function logoutMockSession(): void {
  currentCustomerId = null;
}
