import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { AppScreen, AppText } from '../src/components';
import { spacing } from '../src/constants';
import { useAppSession } from '../src/providers/app-session-provider';
import { useAppSettingsStore } from '../src/stores/app-settings-store';

export default function IndexScreen() {
  const { authReady, hasCompletedHealthProfile, hasSeenOnboarding, isAuthenticated } = useAppSession();

  if (!authReady) {
    return (
      <AppScreen scroll={false} style={{ justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <AppText variant="title" weight="bold">
            GlicoAí
          </AppText>
          <AppText align="center" tone="muted" variant="body">
            Carregando sua experiência.
          </AppText>
        </View>
      </AppScreen>
    );
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (!hasCompletedHealthProfile) {
    return <Redirect href="/health-profile-setup" />;
  }

  return <Redirect href="/(tabs)" />;
}
