/** Shared domain types used by reusable UI. Full API contracts come later. */

export type MoneyPaise = number;

export type ProductSummary = {
  id: string;
  name: string;
  imageUrl?: string | null;
  pricePaise: MoneyPaise;
  compareAtPricePaise?: MoneyPaise | null;
  ratingAverage?: number | null;
  ratingCount?: number | null;
  isPremium?: boolean;
  isAvailable?: boolean;
  discountLabel?: string | null;
};

export type CategorySummary = {
  id: string;
  name: string;
  imageUrl?: string | null;
  productCount?: number;
};

export type AddressSummary = {
  id: string;
  addressType: 'Home' | 'Office' | 'Other' | string;
  name: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  pincode?: string;
  isDefault?: boolean;
};

export type CartLineSummary = {
  id: string;
  productId: string;
  name: string;
  imageUrl?: string | null;
  optionsSummary?: string;
  unitPricePaise: MoneyPaise;
  quantity: number;
  isAvailable?: boolean;
};

export type OrderSummary = {
  id: string;
  publicOrderId: string;
  statusLabel: string;
  fulfilmentLabel?: string;
  totalPaise: MoneyPaise;
  placedAtLabel?: string;
  itemCount?: number;
};
