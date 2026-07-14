export type AppShadowStyle = {
  boxShadow: string;
};

export const shadows = {
  none: {
    boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
  },
  soft: {
    boxShadow: '0 8px 24px rgba(37, 43, 92, 0.08)',
  },
  card: {
    boxShadow: '0 12px 32px rgba(37, 43, 92, 0.1)',
  },
  floating: {
    boxShadow: '0 18px 44px rgba(37, 43, 92, 0.14)',
  },
} as const;

export type AppShadow = keyof typeof shadows;
