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
  isWishlisted?: boolean;
  /**
   * Present only when list/wishlist payload (or cached product data) already
   * states whether required option groups exist. `undefined` means unknown —
   * do not assume the product can be added with empty options.
   */
  hasRequiredOptions?: boolean;
  /** Optional display weight such as `500 g`. Omitted by APIs that do not send it. */
  weightLabel?: string | null;
  /** Optional merchandising label such as `Bestseller` or `New`. */
  badgeLabel?: string | null;
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
  /** Optional distance from the current pin, in kilometres. */
  distanceKm?: number | null;
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
