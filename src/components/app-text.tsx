import type { ReactNode } from 'react';
import type { TextProps, TextStyle } from 'react-native';
import { Text } from 'react-native';

import { typography } from '../constants/typography';
import { useAppTheme } from '../theme/app-theme';

type AppTextVariant = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'label';
type AppTextTone = 'default' | 'muted' | 'inverse' | 'danger' | 'success' | 'warning';

export type AppTextProps = TextProps & {
  children: ReactNode;
  variant?: AppTextVariant;
  tone?: AppTextTone;
  weight?: keyof typeof typography.fontWeight;
  align?: TextStyle['textAlign'];
};

const variantStyles: Record<AppTextVariant, TextStyle> = {
  display: {
    fontSize: 34,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 41,
  },
  title: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 25,
  },
  body: {
    fontSize: 17,
    fontWeight: typography.fontWeight.regular,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    fontWeight: typography.fontWeight.regular,
    lineHeight: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 20,
  },
};

export function AppText({
  children,
  variant = 'body',
  tone = 'default',
  weight,
  align,
  style,
  ...props
}: AppTextProps) {
  const { colors } = useAppTheme();
  const toneColors: Record<AppTextTone, string> = {
    default: colors.text,
    muted: colors.secondaryText,
    inverse: colors.white,
    danger: colors.danger,
    success: colors.success,
    warning: colors.warning,
  };

  return (
    <Text
      {...props}
      style={[
        {
          color: toneColors[tone],
          fontFamily: typography.fontFamily.regular,
          letterSpacing: 0,
          textAlign: align,
        },
        variantStyles[variant],
        weight ? { fontWeight: typography.fontWeight[weight] } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}
