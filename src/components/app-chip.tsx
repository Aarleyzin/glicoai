import type { ReactNode } from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

import { radius } from '../constants/radius';
import { spacing } from '../constants/spacing';
import { useAppTheme } from '../theme/app-theme';
import { AppText } from './app-text';
import { SpringPressable } from './spring-pressable';

export type AppChipProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  selected?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function AppChip({ label, selected = false, icon, disabled, style, ...props }: AppChipProps) {
  const { colors } = useAppTheme();

  return (
    <SpringPressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: disabled ?? undefined }}
      disabled={disabled}
      {...props}
      style={[
        {
          alignItems: 'center',
          backgroundColor: selected ? colors.accent : colors.secondarySurface,
          borderColor: 'transparent',
          borderCurve: 'continuous',
          borderRadius: radius.pill,
          borderWidth: 0,
          flexDirection: 'row',
          gap: spacing.xs,
          minHeight: 44,
          opacity: disabled ? 0.45 : 1,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
        },
        style,
      ]}
    >
      {icon}
      <AppText variant="label" weight={selected ? 'semibold' : 'medium'} style={{ color: selected ? colors.white : colors.text }}>
        {label}
      </AppText>
    </SpringPressable>
  );
}
