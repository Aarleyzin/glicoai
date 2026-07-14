import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { radius } from '../constants/radius';
import { spacing } from '../constants/spacing';
import { useAppTheme } from '../theme/app-theme';
import { AppCard } from './app-card';
import { AppText } from './app-text';
import { StatusBadge, type StatusBadgeTone } from './status-badge';

export type MetricCardProps = {
  label: string;
  value: string | number;
  unit?: string;
  helperText?: string;
  badgeLabel?: string;
  badgeTone?: StatusBadgeTone;
  icon?: ReactNode;
  valueVariant?: 'display' | 'title';
  style?: StyleProp<ViewStyle>;
};

export function MetricCard({
  label,
  value,
  unit,
  helperText,
  badgeLabel,
  badgeTone = 'neutral',
  icon,
  valueVariant = 'display',
  style,
}: MetricCardProps) {
  const { colors } = useAppTheme();

  return (
    <AppCard style={[{ minHeight: 148 }, style]}>
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' }}>
        <AppText variant="label" tone="muted" style={{ flex: 1 }}>
          {label}
        </AppText>
        {icon ? (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: colors.secondarySurface,
              borderRadius: radius.sm,
              height: 36,
              justifyContent: 'center',
              width: 36,
            }}
          >
            {icon}
          </View>
        ) : null}
      </View>

      <View style={{ alignItems: 'baseline', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
        <AppText
          selectable
          variant={valueVariant}
          weight="bold"
          style={{ flexShrink: 1, fontVariant: ['tabular-nums'], letterSpacing: -0.4 }}
        >
          {value}
        </AppText>
        {unit ? (
          <AppText variant="caption" tone="muted">
            {unit}
          </AppText>
        ) : null}
      </View>

      <View style={{ alignItems: 'flex-start', gap: spacing.sm }}>
        {helperText ? (
          <AppText variant="caption" tone="muted">
            {helperText}
          </AppText>
        ) : null}
        {badgeLabel ? <StatusBadge label={badgeLabel} tone={badgeTone} /> : null}
      </View>
    </AppCard>
  );
}
