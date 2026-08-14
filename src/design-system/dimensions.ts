/** Shared layout dimensions and touch targets. */

export const dimensions = {
  touchMin: 44,
  icon: {
    sm: 16,
    md: 24,
    lg: 32,
  },
  avatar: {
    sm: 32,
    md: 48,
  },
  productImage: {
    thumb: 64,
    card: 140,
    hero: 320,
  },
  categoryCard: {
    width: 120,
    image: 72,
    skeletonHeight: 140,
  },
  offerCard: {
    width: 200,
    minHeight: 148,
    imageHeight: 72,
  },
  catalogRowHeight: 160,
  productCarouselMinHeight: 280,
  chipMin: 32,
  bottomNavHeight: 64,
  headerHeight: 56,
  buttonHeight: {
    sm: 36,
    md: 48,
    lg: 56,
  },
  inputHeight: 48,
  badgeMin: 18,
} as const;

export type IconSize = keyof typeof dimensions.icon;
