import type { ReactNode } from 'react';
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import { TextInput, View } from 'react-native';

import { radius } from '../constants/radius';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { useAppTheme } from '../theme/app-theme';
import { AppText } from './app-text';

export type AppInputProps = TextInputProps & {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputWrapperStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
};

export function AppInput({
  label,
  helperText,
  errorText,
  leftSlot,
  rightSlot,
  containerStyle,
  inputWrapperStyle,
  style,
  placeholderTextColor,
  ...props
}: AppInputProps) {
  const { colors } = useAppTheme();
  const hasError = Boolean(errorText);

  return (
    <View style={[{ gap: spacing.xs }, containerStyle]}>
      {label ? <AppText variant="label">{label}</AppText> : null}
      <View
        style={[
          {
            alignItems: 'center',
            backgroundColor: colors.secondarySurface,
            borderColor: hasError ? colors.danger : colors.border,
            borderCurve: 'continuous',
            borderRadius: radius.md,
            borderWidth: hasError ? 1 : 0,
            flexDirection: 'row',
            gap: spacing.sm,
            minHeight: 56,
            paddingHorizontal: spacing.md,
          },
          inputWrapperStyle,
        ]}
      >
        {leftSlot}
        <TextInput
          placeholderTextColor={placeholderTextColor ?? colors.tertiaryText}
          selectionColor={colors.accent}
          {...props}
          style={[
            {
              color: colors.text,
              flex: 1,
              fontFamily: typography.fontFamily.regular,
              fontSize: 17,
              lineHeight: 22,
              paddingVertical: spacing.sm,
            },
            style,
          ]}
        />
        {rightSlot}
      </View>
      {errorText ? (
        <AppText selectable variant="caption" tone="danger">
          {errorText}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" tone="muted">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}
