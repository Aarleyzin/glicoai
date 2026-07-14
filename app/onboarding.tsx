import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, View } from 'react-native';

import { AppButton, AppCard, AppScreen, AppText } from '../src/components';
import { appMascot, radius, spacing } from '../src/constants';
import { useAppSession } from '../src/providers/app-session-provider';
import { useAppTheme } from '../src/theme/app-theme';

const onboardingHighlights = [
  'Registre medições com contexto e sentimento.',
  'Veja sua evolução com uma leitura clara.',
  'Mantenha sua rotina de saúde mais leve.',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAppSession();
  const { colors } = useAppTheme();

  function continueToLogin() {
    completeOnboarding();
    router.replace('/login');
  }

  return (
    <AppScreen contentStyle={{ justifyContent: 'space-between' }}>
      <View style={{ gap: spacing.xxl }}>
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

        <View style={{ gap: spacing.md }}>
          <AppText variant="display" weight="bold" accessibilityRole="header">
            Cuide da sua glicose com leveza
          </AppText>
          <AppText variant="body" tone="muted">
            Acompanhe suas medições, entenda sua evolução e mantenha sua saúde sob controle.
          </AppText>
        </View>

        <AppCard style={{ paddingBottom: spacing.xl, paddingTop: spacing.xxl }}>
          <View style={{ alignItems: 'center', gap: spacing.xl }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: colors.accentSoft,
                borderCurve: 'continuous',
                borderRadius: radius.lg,
                height: 196,
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <Image source={appMascot.heroWelcome} style={{ height: 176, resizeMode: 'contain', width: 176 }} />
            </View>

            <View style={{ gap: spacing.md, width: '100%' }}>
              <AppText variant="subtitle">Seu acompanhamento em um lugar só</AppText>
              {onboardingHighlights.map((item) => (
                <View key={item} style={{ alignItems: 'center', flexDirection: 'row', gap: spacing.sm }}>
                  <View
                    style={{
                      alignItems: 'center',
                      backgroundColor: colors.successSoft,
                      borderRadius: radius.pill,
                      height: 24,
                      justifyContent: 'center',
                      width: 24,
                    }}
                  >
                    <FontAwesome5 color={colors.success} name="check" size={10} solid />
                  </View>
                  <AppText variant="body" tone="muted" style={{ flex: 1 }}>
                    {item}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        </AppCard>
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppButton title="Começar" size="lg" onPress={continueToLogin} />
        <AppButton title="Já tenho uma conta" variant="ghost" onPress={continueToLogin} />
      </View>
    </AppScreen>
  );
}
