import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { radius } from '../constants/radius';
import { spacing } from '../constants/spacing';
import { useAppTheme } from '../theme/app-theme';
import { AppText } from './app-text';

export type AppLoadingStateProps = {
  label?: string;
};

export function AppLoadingState({ label = 'Carregando seus dados' }: AppLoadingStateProps) {
  const { colors } = useAppTheme();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { duration: 700, toValue: 1, useNativeDriver: true }),
        Animated.timing(opacity, { duration: 700, toValue: 0.45, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={{ gap: spacing.lg }}>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <Animated.View style={{ gap: spacing.md, opacity }}>
        <View style={{ backgroundColor: colors.secondarySurface, borderRadius: radius.lg, height: 180 }} />
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ backgroundColor: colors.secondarySurface, borderRadius: radius.lg, flex: 1, height: 112 }} />
          <View style={{ backgroundColor: colors.secondarySurface, borderRadius: radius.lg, flex: 1, height: 112 }} />
        </View>
      </Animated.View>
    </View>
  );
}
