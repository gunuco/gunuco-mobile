import { Platform, TextStyle } from 'react-native';

/**
 * Typography tokens.
 * Custom brand fonts are pending (Q46). Until then we use platform system fonts
 * with distinct size/weight hierarchy — swap fontFamily centrally when assets arrive.
 */

const fontSans = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const fontDisplay = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia',
});

export type TextVariant =
  | 'display'
  | 'titleLg'
  | 'titleMd'
  | 'titleSm'
  | 'bodyLg'
  | 'bodyMd'
  | 'bodySm'
  | 'label'
  | 'caption'
  | 'priceLg'
  | 'priceMd'
  | 'priceSm';

type VariantStyle = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'fontWeight' | 'letterSpacing'
>;

export const typography: Record<TextVariant, VariantStyle> = {
  display: {
    fontFamily: fontDisplay,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  titleLg: {
    fontFamily: fontSans,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  titleMd: {
    fontFamily: fontSans,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  titleSm: {
    fontFamily: fontSans,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  bodyLg: {
    fontFamily: fontSans,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyMd: {
    fontFamily: fontSans,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  bodySm: {
    fontFamily: fontSans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  label: {
    fontFamily: fontSans,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  caption: {
    fontFamily: fontSans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  priceLg: {
    fontFamily: fontSans,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: 0,
  },
  priceMd: {
    fontFamily: fontSans,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  priceSm: {
    fontFamily: fontSans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
};

export const fontFamilies = {
  sans: fontSans,
  display: fontDisplay,
} as const;
