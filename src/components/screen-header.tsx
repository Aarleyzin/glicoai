import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { spacing } from '../constants/spacing';
import { AppText } from './app-text';

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ScreenHeader({ title, subtitle, eyebrow, action, style }: ScreenHeaderProps) {
  return (
    <View style={[{ gap: spacing.sm, paddingBottom: spacing.xs, paddingTop: spacing.xs }, style]}>
      <View style={{ alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          {eyebrow ? (
            <AppText variant="caption" tone="muted" weight="semibold">
              {eyebrow}
            </AppText>
          ) : null}
          <AppText variant="display" accessibilityRole="header">
            {title}
          </AppText>
        </View>
        {action}
      </View>
      {subtitle ? (
        <AppText variant="body" tone="muted">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}
