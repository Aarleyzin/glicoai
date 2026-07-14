import { FontAwesome5 } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { radius } from '../constants/radius';
import { spacing } from '../constants/spacing';
import { useAppTheme } from '../theme/app-theme';
import { AppCard } from './app-card';
import { AppScreen } from './app-screen';
import { AppText } from './app-text';
import { ScreenHeader } from './screen-header';

export type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  notice?: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ eyebrow, title, subtitle, children, notice, footer }: AuthShellProps) {
  const { colors } = useAppTheme();

  return (
    <AppScreen contentStyle={{ gap: spacing.xl }}>
      <View style={{ alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: spacing.sm }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.accentSoft,
            borderRadius: radius.sm,
            height: 36,
            justifyContent: 'center',
            width: 36,
          }}
        >
          <FontAwesome5 color={colors.accent} name="tint" size={16} solid />
        </View>
        <AppText variant="subtitle" weight="bold">
          GlicoAí
        </AppText>
      </View>

      <ScreenHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
      {notice}
      <AppCard style={{ gap: spacing.lg }}>{children}</AppCard>
      {footer}
    </AppScreen>
  );
}
