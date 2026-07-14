import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { radius } from '../constants/radius';
import { spacing } from '../constants/spacing';
import { useAppTheme } from '../theme/app-theme';
import { AppText } from './app-text';

export type StatusBadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'mint' | 'lavender';

export type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
  style?: StyleProp<ViewStyle>;
};

export function StatusBadge({ label, tone = 'neutral', style }: StatusBadgeProps) {
  const { colors } = useAppTheme();
  const toneStyles: Record<StatusBadgeTone, { backgroundColor: string; textColor: string }> = {
    neutral: { backgroundColor: colors.secondarySurface, textColor: colors.secondaryText },
    success: { backgroundColor: colors.successSoft, textColor: colors.success },
    warning: { backgroundColor: colors.warningSoft, textColor: colors.warning },
    danger: { backgroundColor: colors.dangerSoft, textColor: colors.danger },
    mint: { backgroundColor: colors.mintSoft, textColor: colors.success },
    lavender: { backgroundColor: colors.lavenderSoft, textColor: colors.secondaryText },
  };
  const toneStyle = toneStyles[tone];

  return (
    <View
      style={[
        {
          alignItems: 'center',
          alignSelf: 'flex-start',
          backgroundColor: toneStyle.backgroundColor,
          borderCurve: 'continuous',
          borderRadius: radius.pill,
          justifyContent: 'center',
          minHeight: 28,
          paddingHorizontal: spacing.sm,
        },
        style,
      ]}
    >
      <AppText variant="caption" weight="semibold" style={{ color: toneStyle.textColor }}>
        {label}
      </AppText>
    </View>
  );
}
