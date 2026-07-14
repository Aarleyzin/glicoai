import { FontAwesome5 } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { radius } from '../constants/radius';
import { spacing } from '../constants/spacing';
import { useAppTheme } from '../theme/app-theme';
import { AppText } from './app-text';
import { SpringPressable } from './spring-pressable';

export type AppListRowProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  showSeparator?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppListRow({
  title,
  subtitle,
  icon,
  trailing,
  onPress,
  destructive = false,
  showSeparator = false,
  style,
}: AppListRowProps) {
  const { colors } = useAppTheme();

  return (
    <SpringPressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={[
        {
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderBottomColor: showSeparator ? colors.separator : 'transparent',
          borderBottomWidth: showSeparator ? 1 : 0,
          flexDirection: 'row',
          gap: spacing.md,
          minHeight: 68,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        },
        style,
      ]}
    >
      {icon ? (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: destructive ? colors.dangerSoft : colors.secondarySurface,
            borderRadius: radius.sm,
            height: 36,
            justifyContent: 'center',
            width: 36,
          }}
        >
          {icon}
        </View>
      ) : null}

      <View style={{ flex: 1, gap: spacing.xxs }}>
        <AppText variant="body" weight="semibold" tone={destructive ? 'danger' : 'default'}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted">
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {trailing ?? (onPress ? <FontAwesome5 color={colors.tertiaryText} name="chevron-right" size={13} solid /> : null)}
    </SpringPressable>
  );
}
