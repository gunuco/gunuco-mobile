import { darkColors, lightColors, type ColorTokens } from './colors';
import { typography, type TextVariant } from './typography';
import { spacing, type SpacingKey } from './spacing';
import { dimensions } from './dimensions';
import { radius, type RadiusKey } from './radius';
import { shadows, type ShadowKey } from './shadows';
import { animations } from './animations';

export type ThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  colors: ColorTokens;
  typography: typeof typography;
  spacing: typeof spacing;
  dimensions: typeof dimensions;
  radius: typeof radius;
  shadows: typeof shadows;
  animations: typeof animations;
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: lightColors,
  typography,
  spacing,
  dimensions,
  radius,
  shadows,
  animations,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: darkColors,
  typography,
  spacing,
  dimensions,
  radius,
  shadows,
  animations,
};

export type { ColorTokens, TextVariant, SpacingKey, RadiusKey, ShadowKey };
