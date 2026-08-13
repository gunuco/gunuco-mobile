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
