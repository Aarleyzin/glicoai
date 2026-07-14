import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { radius } from '../constants/radius';
import { spacing } from '../constants/spacing';
import { useAppTheme } from '../theme/app-theme';
import { AppButton, type AppButtonProps } from './app-button';
import { AppText } from './app-text';

export type EmptyStateProps = {
  title: string;
  message: string;
  icon?: ReactNode;
  action?: Pick<AppButtonProps, 'title' | 'onPress' | 'variant'>;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({ title, message, icon, action, style }: EmptyStateProps) {
  const { colors, shadow } = useAppTheme();

  return (
    <View
      style={[
        {
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderCurve: 'continuous',
          borderRadius: radius.lg,
          boxShadow: shadow,
          gap: spacing.xl,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.xxxl,
        },
        style,
      ]}
    >
      {icon ? (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.secondarySurface,
            borderCurve: 'continuous',
            borderRadius: radius.lg,
            height: 80,
            justifyContent: 'center',
            width: 80,
          }}
        >
          {icon}
        </View>
      ) : null}
      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <AppText variant="subtitle" align="center">
          {title}
        </AppText>
        <AppText variant="body" tone="muted" align="center">
          {message}
        </AppText>
      </View>
      {action ? <AppButton {...action} fullWidth={false} /> : null}
    </View>
  );
}
