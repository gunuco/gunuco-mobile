/**
 * GUNUCO semantic color tokens.
 * Brand hex values are provisional until final brand assets arrive (Q46).
 * Cocoa / cream commerce palette — not BigBasket colors.
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

export const lightColors: ColorTokens = {
  bg: {
    canvas: '#F7F3EE',
    surface: '#FFFFFF',
    surfaceMuted: '#EFE8E0',
    inverse: '#2A1F18',
  },
  text: {
    primary: '#2A1F18',
    secondary: '#6B5B4F',
    disabled: '#A8988C',
    inverse: '#FFFFFF',
  },
  brand: {
    primary: '#5C3A2E',
    primaryPressed: '#472C23',
    secondary: '#C4A484',
  },
  accent: {
    offer: '#B85C38',
  },
  border: {
    default: '#E2D6CB',
    focus: '#5C3A2E',
  },
  semantic: {
    success: '#2F6B4F',
    warning: '#B8891E',
    danger: '#B42318',
    info: '#2F5D8A',
  },
  overlay: {
    scrim: 'rgba(42, 31, 24, 0.48)',
  },
  skeleton: {
    base: '#E8DFD6',
    highlight: '#F5F0EA',
  },
  badge: {
    premium: '#8A6A2F',
    discount: '#B85C38',
  },
  map: {
    route: '#5C3A2E',
  },
};

export const darkColors: ColorTokens = {
  bg: {
    canvas: '#161210',
    surface: '#221B17',
    surfaceMuted: '#2C241F',
    inverse: '#F7F3EE',
  },
  text: {
    primary: '#F7F3EE',
    secondary: '#C9B8AA',
    disabled: '#7A6C62',
    inverse: '#2A1F18',
  },
  brand: {
    primary: '#D4B59A',
    primaryPressed: '#E2C9B3',
    secondary: '#8B6B52',
  },
  accent: {
    offer: '#E08A62',
  },
  border: {
    default: '#3A302A',
    focus: '#D4B59A',
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
    base: '#2C241F',
    highlight: '#3A302A',
  },
  badge: {
    premium: '#D4B56A',
    discount: '#E08A62',
  },
  map: {
    route: '#D4B59A',
  },
};
