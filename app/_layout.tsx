import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppScreen, AppText } from '../src/components';
import { appMascot, spacing } from '../src/constants';
import { AppSessionProvider, useAppSession } from '../src/providers/app-session-provider';
import { useAppTheme } from '../src/theme/app-theme';

type RootErrorBoundaryState = { error: Error | null };

class RootErrorBoundary extends React.Component<React.PropsWithChildren, RootErrorBoundaryState> {
  state: RootErrorBoundaryState = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('Root render error', error); }

  render() {
    if (this.state.error) {
      return (
        <View style={{ backgroundColor: '#F2F2F7', flex: 1, padding: spacing.xl }}>
          <ScrollView contentContainerStyle={{ gap: spacing.md, paddingVertical: spacing.xxxl }}>
            <Text style={{ color: '#17172E', fontFamily: 'System', fontSize: 34, fontWeight: '700' }}>GlicoAí</Text>
            <Text style={{ color: '#17172E', fontFamily: 'System', fontSize: 20, fontWeight: '600' }}>Não foi possível abrir o app</Text>
            <Text style={{ color: '#68687F', fontFamily: 'System', fontSize: 17, lineHeight: 24 }}>
              {this.state.error.message || 'Ocorreu um erro inesperado. Feche e abra o aplicativo novamente.'}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

function BootScreen() {
  const { colors, floatingShadow } = useAppTheme();
  return (
    <AppScreen scroll={false} style={{ justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', gap: spacing.xl }}>
        <View style={{ alignItems: 'center', backgroundColor: colors.surface, borderCurve: 'continuous', borderRadius: 36, boxShadow: floatingShadow, height: 124, justifyContent: 'center', width: 124 }}>
          <Image source={appMascot.pointing} style={{ height: 104, resizeMode: 'contain', width: 104 }} />
        </View>
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <AppText variant="display" weight="bold">GlicoAí</AppText>
          <AppText align="center" tone="muted" variant="body">Preparando seu acompanhamento.</AppText>
        </View>
      </View>
    </AppScreen>
  );
}

function RouteGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { authReady, hasCompletedHealthProfile, hasSeenOnboarding, isAuthenticated } = useAppSession();

  useEffect(() => {
    if (!authReady) return;
    const rootSegment = segments[0] ?? 'index';
    const isPublicRoute = ['index', 'splash', 'onboarding', 'login', 'register', 'forgot-password'].includes(rootSegment);
    const isHealthProfileRoute = rootSegment === 'health-profile-setup';

    if (!hasSeenOnboarding && rootSegment !== 'onboarding' && rootSegment !== 'splash') { router.replace('/onboarding'); return; }
    if (hasSeenOnboarding && !isAuthenticated && !isPublicRoute) { router.replace('/login'); return; }
    if (hasSeenOnboarding && isAuthenticated && !hasCompletedHealthProfile && !isHealthProfileRoute && rootSegment !== 'splash') { router.replace('/health-profile-setup'); return; }
    if (hasSeenOnboarding && isAuthenticated && hasCompletedHealthProfile && ['login', 'register', 'forgot-password', 'onboarding', 'health-profile-setup'].includes(rootSegment)) router.replace('/(tabs)');
  }, [authReady, hasCompletedHealthProfile, hasSeenOnboarding, isAuthenticated, router, segments]);

  return null;
}

function RootNavigator() {
  const { authReady } = useAppSession();
  const { colors } = useAppTheme();
  if (!authReady) return <BootScreen />;

  return (
    <>
      <RouteGuard />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', animationDuration: 260, contentStyle: { backgroundColor: colors.background } }} />
    </>
  );
}

export default function RootLayout() {
  return <SafeAreaProvider><RootErrorBoundary><AppSessionProvider><RootNavigator /></AppSessionProvider></RootErrorBoundary></SafeAreaProvider>;
}
