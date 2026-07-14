import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { radius } from '../constants/radius';
import { spacing } from '../constants/spacing';
import { useAppTheme } from '../theme/app-theme';
import { AppText } from './app-text';

export type AppSectionProps = {
  title?: string;
  footer?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function AppSection({ title, footer, children, style }: AppSectionProps) {
  const { colors, shadow } = useAppTheme();

  return (
    <View style={[{ gap: spacing.sm }, style]}>
      {title ? (
        <AppText variant="label" tone="muted" style={{ paddingHorizontal: spacing.xs, textTransform: 'uppercase' }}>
          {title}
        </AppText>
      ) : null}
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderCurve: 'continuous',
          borderRadius: radius.lg,
          borderWidth: 0,
          boxShadow: shadow,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
      {footer ? (
        <AppText variant="caption" tone="muted" style={{ paddingHorizontal: spacing.xs }}>
          {footer}
        </AppText>
      ) : null}
    </View>
  );
}
