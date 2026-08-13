import type { CategorySummary, ProductSummary } from './commerce';

export type HomeBanner = {
  id: string;
  title?: string | null;
  imageUrl: string;
  linkType?: 'product' | 'category' | 'offer' | 'url' | string | null;
  linkId?: string | null;
};

export type HomeOffer = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  badgeLabel?: string | null;
};

export type HomeDeliveryContext = {
  label: string;
  addressId?: string | null;
  isServiceable?: boolean;
};

export type HomeResponse = {
  deliveryContext?: HomeDeliveryContext | null;
  banners?: HomeBanner[];
  mainCategories?: CategorySummary[];
  subcategories?: CategorySummary[];
  featuredProducts?: ProductSummary[];
  bestSellers?: ProductSummary[];
  offers?: HomeOffer[];
  recommendedProducts?: ProductSummary[];
  unreadNotificationCount?: number;
};
