import type { ReactNode } from 'react';
import type { PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { ActivityIndicator } from 'react-native';

import { radius } from '../constants/radius';
import { spacing } from '../constants/spacing';
import { useAppTheme } from '../theme/app-theme';
import { AppText } from './app-text';
import { SpringPressable } from './spring-pressable';

type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type AppButtonSize = 'sm' | 'md' | 'lg';

export type AppButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const sizeStyles: Record<AppButtonSize, ViewStyle> = {
  sm: { minHeight: 44, paddingHorizontal: spacing.md },
  md: { minHeight: 52, paddingHorizontal: spacing.lg },
  lg: { minHeight: 58, paddingHorizontal: spacing.xl },
};

export function AppButton({
  title,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  disabled,
  fullWidth = true,
  style,
  textStyle,
  ...props
}: AppButtonProps) {
  const { colors, floatingShadow } = useAppTheme();
  const isDisabled = disabled || loading;
  const backgrounds: Record<AppButtonVariant, string> = {
    primary: colors.accent,
    secondary: colors.secondarySurface,
    ghost: 'transparent',
    danger: colors.danger,
  };
  const textColor = variant === 'primary' || variant === 'danger' ? colors.white : variant === 'ghost' ? colors.accent : colors.text;

  return (
    <SpringPressable
      accessibilityRole="button"
      disabled={isDisabled}
      {...props}
      style={[
        {
          alignItems: 'center',
          backgroundColor: backgrounds[variant],
          borderColor: 'transparent',
          borderCurve: 'continuous',
          borderRadius: radius.md,
          borderWidth: 0,
          boxShadow: variant === 'primary' ? floatingShadow : '0 0 0 rgba(0, 0, 0, 0)',
          flexDirection: 'row',
          gap: spacing.sm,
          justifyContent: 'center',
          opacity: isDisabled ? 0.46 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        sizeStyles[size],
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : iconLeft}
      <AppText variant="label" weight="bold" style={[{ color: textColor }, textStyle]}>
        {title}
      </AppText>
      {!loading ? iconRight : null}
    </SpringPressable>
  );
}
