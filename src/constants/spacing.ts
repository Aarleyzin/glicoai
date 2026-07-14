export const spacing = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxxl: 52,
  screen: 24,
  bottomTabs: 110,
} as const;

export type AppSpacing = keyof typeof spacing;
