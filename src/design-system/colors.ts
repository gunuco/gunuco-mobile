/**
 * GUNUCO semantic color tokens.
 * Brand pair from the company logo: burgundy `#6F022B` + white `#FFFFFF`.
 */

export type ColorTokens = {
  bg: {
    canvas: string;
    surface: string;
    surfaceMuted: string;
    inverse: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  brand: {
    primary: string;
    primaryPressed: string;
    secondary: string;
  };
  accent: {
    offer: string;
  };
  border: {
    default: string;
    focus: string;
  };
  semantic: {
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
  overlay: {
    scrim: string;
  };
  skeleton: {
    base: string;
    highlight: string;
  };
  badge: {
    premium: string;
    discount: string;
  };
  map: {
    route: string;
  };
};

/** Sampled from the GUNUCO logo circle (most common non-white pixel). */
const BRAND_BURGUNDY = '#6F022B';
const BRAND_BURGUNDY_PRESSED = '#54021F';
const BRAND_ROSE = '#A64B63';
const LOGO_WHITE = '#FFFFFF';
const INK = '#2A0A14';

export const lightColors: ColorTokens = {
  bg: {
    canvas: LOGO_WHITE,
    surface: LOGO_WHITE,
    surfaceMuted: '#F7F1F3',
    inverse: INK,
  },
  text: {
    primary: INK,
    secondary: '#6B4450',
    disabled: '#A88A92',
    inverse: LOGO_WHITE,
  },
  brand: {
    primary: BRAND_BURGUNDY,
    primaryPressed: BRAND_BURGUNDY_PRESSED,
    secondary: BRAND_ROSE,
  },
  accent: {
    offer: '#B01040',
  },
  border: {
    default: '#E8D4DA',
    focus: BRAND_BURGUNDY,
  },
  semantic: {
    success: '#2F6B4F',
    warning: '#B8891E',
    danger: '#B42318',
    info: '#2F5D8A',
  },
  overlay: {
    scrim: 'rgba(42, 10, 20, 0.48)',
  },
  skeleton: {
    base: '#F0E2E6',
    highlight: '#FAF6F7',
  },
  badge: {
    premium: '#8A6A2F',
    discount: '#B01040',
  },
  map: {
    route: BRAND_BURGUNDY,
  },
};

export const darkColors: ColorTokens = {
  bg: {
    canvas: '#12060A',
    surface: '#1C0C12',
    surfaceMuted: '#2A1218',
    inverse: '#FAF6F7',
  },
  text: {
    primary: '#FAF6F7',
    secondary: '#D4B8C0',
    disabled: '#7A5C64',
    inverse: INK,
  },
  brand: {
    primary: BRAND_BURGUNDY,
    primaryPressed: '#8B0A38',
    secondary: '#8B4A5C',
  },
  accent: {
    offer: '#E05A7A',
  },
  border: {
    default: '#3A1C24',
    focus: '#C45A74',
  },
  semantic: {
    success: '#5FBF93',
    warning: '#E0B34A',
    danger: '#F04438',
    info: '#6BA3D6',
  },
  overlay: {
    scrim: 'rgba(0, 0, 0, 0.64)',
  },
  skeleton: {
    base: '#2A1218',
    highlight: '#3A1C24',
  },
  badge: {
    premium: '#D4B56A',
    discount: '#E05A7A',
  },
  map: {
    route: '#C45A74',
  },
};
