import type { MoneyPaise } from './commerce';

export type CartSelectedOption = {
  groupId?: string;
  groupLabel?: string;
  valueIds?: string[];
  valueLabels?: string[];
  summary?: string;
};

export type CartChange = {
  type?: string;
  message?: string;
  productName?: string;
  previousPricePaise?: MoneyPaise;
  currentPricePaise?: MoneyPaise;
};

export type CartLine = {
  id: string;
  productId: string;
  name: string;
  imageUrl?: string | null;
  quantity: number;
  quantityMin?: number;
  quantityMax?: number;
  unitPricePaise: MoneyPaise;
  lineTotalPaise?: MoneyPaise;
  compareAtPricePaise?: MoneyPaise | null;
  previousPricePaise?: MoneyPaise;
  optionsSummary?: string;
  selectedOptions?: CartSelectedOption[];
  isAvailable?: boolean;
  availabilityLabel?: string | null;
  priceChanged?: boolean;
  optionsChanged?: boolean;
  quantityChanged?: boolean;
  changes?: CartChange[];
};

export type CartTotals = {
  subtotalPaise?: MoneyPaise;
  discountPaise?: MoneyPaise;
  storeCreditPaise?: MoneyPaise;
  taxPaise?: MoneyPaise;
  deliveryFeePaise?: MoneyPaise;
  totalPaise?: MoneyPaise;
};

export type CartCoupon = {
  code: string;
  label?: string | null;
};

export type Cart = {
  id?: string;
  items: CartLine[];
  totals: CartTotals;
  coupon?: CartCoupon | null;
  storeCreditApplied?: boolean;
  itemCount?: number;
  totalQuantity?: number;
  isValid?: boolean;
  canCheckout?: boolean;
  checkoutBlocked?: boolean;
  checkoutBlockedReason?: string | null;
  changes?: CartChange[];
  message?: string | null;
};

export type UpdateCartItemPayload = {
  itemId: string;
  quantity: number;
};

export type ApplyCouponPayload = {
  code: string;
};
