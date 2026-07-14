import { View } from 'react-native';

import { radius } from '../constants/radius';
import { spacing } from '../constants/spacing';
import { useAppTheme } from '../theme/app-theme';
import { AppText } from './app-text';

export type SimpleRangeBarProps = {
  value: number;
  label: string;
  valueLabel: string;
};

export function SimpleRangeBar({ value, label, valueLabel }: SimpleRangeBarProps) {
  const { colors } = useAppTheme();
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText variant="label">{label}</AppText>
        <AppText variant="label" tone="muted">
          {valueLabel}
        </AppText>
      </View>

      <View
        style={{
          backgroundColor: colors.secondarySurface,
          borderCurve: 'continuous',
          borderRadius: radius.pill,
          height: 12,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            backgroundColor: colors.success,
            borderCurve: 'continuous',
            borderRadius: radius.pill,
            height: 12,
            width: `${clampedValue}%`,
          }}
        />
      </View>
    </View>
  );
}

