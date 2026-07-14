import type { ReactNode } from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { radius } from '../constants/radius';
import { spacing } from '../constants/spacing';
import { useAppTheme } from '../theme/app-theme';
import { SpringPressable } from './spring-pressable';

type AppCardTone = 'white' | 'cream' | 'mint' | 'lavender' | 'coral';

export type AppCardProps = {
  children: ReactNode;
  tone?: AppCardTone;
  padded?: boolean;
  pressable?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: PressableProps['onPress'];
};

export function AppCard({
  children,
  tone = 'white',
  padded = true,
  pressable = false,
  style,
  onPress,
}: AppCardProps) {
  const { colors, shadow } = useAppTheme();
  const toneBackground: Record<AppCardTone, string> = {
    white: colors.surface,
    cream: colors.surface,
    mint: colors.surface,
    lavender: colors.surface,
    coral: colors.dangerSoft,
  };
  const cardStyle: ViewStyle = {
    backgroundColor: toneBackground[tone],
    borderColor: colors.border,
    borderCurve: 'continuous',
    borderRadius: radius.lg,
    borderWidth: 0,
    boxShadow: shadow,
    gap: spacing.md,
    padding: padded ? spacing.xl : 0,
  };

  if (pressable || onPress) {
    return (
      <SpringPressable onPress={onPress} style={[cardStyle, style]}>
        {children}
      </SpringPressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}

