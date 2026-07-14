import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Image, View } from 'react-native';

import { AppScreen, AppText, BottomSpacer } from '../src/components';
import { appMascot, radius, spacing } from '../src/constants';
import { useAppSession } from '../src/providers/app-session-provider';
import { useAppSettingsStore } from '../src/stores/app-settings-store';
import { useAppTheme } from '../src/theme/app-theme';

export default function SplashScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const pulse = useRef(new Animated.Value(0.92)).current;
  const { authReady, hasCompletedHealthProfile, hasSeenOnboarding, isAuthenticated } = useAppSession();
  const hasHydrated = useAppSettingsStore((state) => state.hasHydrated);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.spring(pulse, { damping: 12, stiffness: 120, toValue: 1, useNativeDriver: true }),
        Animated.spring(pulse, { damping: 12, stiffness: 120, toValue: 0.92, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  useEffect(() => {
    if (!hasHydrated || !authReady) return;

    const timeout = setTimeout(() => {
      if (!hasSeenOnboarding) return router.replace('/onboarding');
      if (!isAuthenticated) return router.replace('/login');
      if (!hasCompletedHealthProfile) return router.replace('/health-profile-setup');
      router.replace('/(tabs)');
    }, 900);

    return () => clearTimeout(timeout);
  }, [authReady, hasCompletedHealthProfile, hasHydrated, hasSeenOnboarding, isAuthenticated, router]);

  return (
    <AppScreen scroll={false} contentStyle={{ justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', gap: spacing.xl }}>
        <Animated.View
          style={{
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderCurve: 'continuous',
            borderRadius: radius.lg,
            borderWidth: 1,
            height: 136,
            justifyContent: 'center',
            transform: [{ scale: pulse }],
            width: 136,
          }}
        >
          <Image source={appMascot.pointing} style={{ height: 112, resizeMode: 'contain', width: 112 }} />
        </Animated.View>

        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <AppText variant="title" weight="bold">
            GlicoAí
          </AppText>
          <AppText variant="body" tone="muted" align="center">
            Seu acompanhamento de glicose com leveza e clareza.
          </AppText>
        </View>

        <View style={{ backgroundColor: colors.tertiarySurface, borderRadius: radius.pill, height: 4, overflow: 'hidden', width: 120 }}>
          <Animated.View style={{ backgroundColor: colors.accent, borderRadius: radius.pill, height: 4, transform: [{ scaleX: pulse }], width: 120 }} />
        </View>
      </View>
      <BottomSpacer height={spacing.xxxl} />
    </AppScreen>
  );
}
