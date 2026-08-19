import type { CategorySummary, MoneyPaise, ProductSummary } from './commerce';

export type ProductImage = {
  id?: string;
  url: string;
  alt?: string | null;
};

export type ProductOfferInfo = {
  id?: string;
  title: string;
  subtitle?: string | null;
};

export type ProductInfoSection = {
  id?: string;
  title: string;
  body: string;
};

export type ProductHighlight = {
  label: string;
  value: string;
};

export type ProductOptionValue = {
  id: string;
  label: string;
  available?: boolean;
  unavailableLabel?: string | null;
  unavailableReason?: string | null;
  pricePaise?: MoneyPaise | null;
  compareAtPricePaise?: MoneyPaise | null;
  discountLabel?: string | null;
  isDefault?: boolean;
};

export type ProductOptionGroup = {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  defaultValueId?: string | null;
  minSelect?: number;
  maxSelect?: number;
  options: ProductOptionValue[];
};

export type ProductVariant = {
  id: string;
  optionValueIds: string[];
  pricePaise: MoneyPaise;
  compareAtPricePaise?: MoneyPaise | null;
  discountLabel?: string | null;
  isAvailable?: boolean;
};

export type ProductDetail = ProductSummary & {
  description?: string | null;
  images?: ProductImage[];
  offerLabel?: string | null;
  offerMessage?: string | null;
  offer?: ProductOfferInfo | null;
  offers?: ProductOfferInfo[];
  availabilityStatus?: string | null;
  availabilityLabel?: string | null;
  quantityMin?: number;
  quantityMax?: number;
  infoSections?: ProductInfoSection[];
  highlights?: ProductHighlight[];
  optionGroups?: ProductOptionGroup[];
  category?: CategorySummary | null;
  isWishlisted?: boolean;
};

export type ProductOptionsResponse = {
  groups: ProductOptionGroup[];
  variants?: ProductVariant[];
};

export type ProductOptionSelection = Record<string, string[]>;

export type DisplayedProductPrice = {
  pricePaise: MoneyPaise;
  compareAtPricePaise?: MoneyPaise | null;
  discountLabel?: string | null;
  isAvailable: boolean;
};

export type AddCartItemPayload = {
  productId: string;
  quantity: number;
  options: {
    groupId: string;
    valueIds: string[];
  }[];
};

export type AddCartItemResponse = {
  itemId?: string;
  cartId?: string;
};
