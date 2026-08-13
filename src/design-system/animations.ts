export const animations = {
  duration: {
    instant: 100,
    fast: 180,
    normal: 280,
    slow: 400,
  },
  easing: {
    standard: 'ease-in-out' as const,
    emphasized: 'ease-out' as const,
  },
} as const;
