import { Platform, ViewStyle } from 'react-native';

type ShadowToken = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

const makeShadow = (
  offsetY: number,
  radiusValue: number,
  opacity: number,
  elevation: number,
): ShadowToken => ({
  shadowColor: '#2A0A14',
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: Platform.OS === 'ios' ? opacity : 0,
  shadowRadius: radiusValue,
  elevation: Platform.OS === 'android' ? elevation : 0,
});

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } satisfies ShadowToken,
  sm: makeShadow(1, 2, 0.08, 1),
  md: makeShadow(4, 8, 0.12, 3),
  lg: makeShadow(8, 16, 0.16, 6),
} as const;

export type ShadowKey = keyof typeof shadows;
