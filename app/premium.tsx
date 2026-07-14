import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';

import { AppButton, AppCard, AppScreen, AppText, ScreenHeader, StatusBadge } from '../src/components';
import { appMascot, colors, spacing } from '../src/constants';
import {
  freePlanBenefits,
  premiumPlanBenefits,
} from '../src/services/subscriptions/subscription-types';
import { useAppSession } from '../src/providers/app-session-provider';
import { useSubscriptionStore } from '../src/stores/subscription-store';

const comparisonRows = [
  { feature: 'Registrar medições', free: 'Incluído', premium: 'Incluído' },
  { feature: 'Dashboard', free: 'Básico', premium: 'Completo' },
  { feature: 'Histórico', free: '7 dias', premium: 'Ilimitado' },
  { feature: 'Relatórios PDF', free: 'Não incluído', premium: 'Incluído' },
  { feature: 'Assistente IA', free: 'Local básico', premium: 'Avançado' },
  { feature: 'Lembretes', free: 'Limitados', premium: 'Ilimitados' },
  { feature: 'Backup em nuvem', free: 'Não incluído', premium: 'Incluído' },
] as const;

export default function PremiumScreen() {
  const router = useRouter();
  const { session } = useAppSession();
  const isPremium = useSubscriptionStore((state) => state.isPremium);
  const plan = useSubscriptionStore((state) => state.plan);
  const error = useSubscriptionStore((state) => state.error);
  const configure = useSubscriptionStore((state) => state.configure);
  const refresh = useSubscriptionStore((state) => state.refresh);
  const purchasePremium = useSubscriptionStore((state) => state.purchasePremium);
  const restorePurchase = useSubscriptionStore((state) => state.restorePurchase);

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    void configure(session?.user.id ?? null).then((result) => {
      setMessage(result.snapshot?.isPremium ? 'Seu plano Premium está ativo.' : null);
      void refresh();
    });
  }, [configure, refresh, session?.user.id]);

  async function handlePurchase() {
    setIsLoading(true);
    const result = await purchasePremium();
    setMessage(result.success ? 'Premium estará disponível em breve. Você pode continuar no plano gratuito.' : result.message);
    setIsLoading(false);
  }

  async function handleRestore() {
    setIsLoading(true);
    const result = await restorePurchase();
    setMessage(result.success ? 'Verificamos suas compras. Nenhum plano Premium ativo foi encontrado.' : result.message);
    setIsLoading(false);
  }

  return (
    <AppScreen>
      <ScreenHeader title="GlicoAí Premium" subtitle="Mais clareza para acompanhar sua saúde." eyebrow="Freemium" />

      <AppCard tone="lavender">
        <View style={{ gap: spacing.sm }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' }}>
            <AppText variant="title">Seu plano atual</AppText>
            <StatusBadge label={isPremium ? 'Premium' : 'Grátis'} tone={isPremium ? 'success' : 'lavender'} />
          </View>
          <Image source={appMascot.celebrating} style={{ alignSelf: 'center', height: 104, resizeMode: 'contain', width: 104 }} />
          <AppText variant="body" tone="muted">
            {isPremium
              ? 'Recursos Premium habilitados para acompanhar sua rotina com mais profundidade.'
              : 'Você continua com os recursos essenciais. O Premium destrava análises e exportações avançadas.'}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <StatusBadge label={plan === 'premium' ? 'Plano Premium' : 'Plano gratuito'} tone={plan === 'premium' ? 'success' : 'neutral'} />
            {!isPremium ? <StatusBadge label="Premium em breve" tone="mint" /> : null}
          </View>
        </View>
      </AppCard>

      {!isPremium ? (
        <AppCard tone="cream">
          <AppText variant="subtitle">Premium em breve</AppText>
          <AppText variant="body" tone="muted">
            Estamos preparando recursos avançados para acompanhar sua saúde com mais clareza. Você pode continuar usando o plano gratuito normalmente.
          </AppText>
        </AppCard>
      ) : null}

      <View style={{ gap: spacing.md }}>
        <AppText variant="subtitle">Benefícios Premium</AppText>
        {premiumPlanBenefits.map((benefit) => (
          <AppCard key={benefit} tone="white" style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: colors.mint,
                borderRadius: 999,
                height: 28,
                justifyContent: 'center',
                width: 28,
              }}
            >
              <AppText variant="label">+</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="body">{benefit}</AppText>
            </View>
          </AppCard>
        ))}
      </View>

      <AppCard>
        <AppText variant="subtitle">Free vs Premium</AppText>
        <View style={{ gap: spacing.sm }}>
          {comparisonRows.map((row) => (
            <View
              key={row.feature}
              style={{
                borderBottomColor: 'rgba(37, 43, 92, 0.08)',
                borderBottomWidth: 1,
                gap: spacing.xs,
                paddingBottom: spacing.sm,
              }}
            >
              <AppText variant="label">{row.feature}</AppText>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" tone="muted">
                    Free
                  </AppText>
                  <AppText variant="body">{row.free}</AppText>
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" tone="muted">
                    Premium
                  </AppText>
                  <AppText variant="body">{row.premium}</AppText>
                </View>
              </View>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard tone="mint">
        <AppText variant="subtitle">Plano gratuito incluído</AppText>
        <View style={{ gap: spacing.xs }}>
          {freePlanBenefits.map((benefit) => (
            <AppText key={benefit} variant="caption" tone="muted">
              {benefit}
            </AppText>
          ))}
        </View>
      </AppCard>

      {message || error ? (
        <AppCard tone={error ? 'coral' : 'white'}>
          <AppText variant="caption" tone="muted">
            {error ?? message}
          </AppText>
        </AppCard>
      ) : null}

      <View style={{ gap: spacing.md }}>
        <AppButton title="Avisar quando estiver disponível" onPress={() => void handlePurchase()} loading={isLoading} />
        <AppButton title="Restaurar compra" variant="secondary" onPress={() => void handleRestore()} loading={isLoading} />
        <AppButton title="Continuar grátis" variant="ghost" onPress={() => router.back()} />
      </View>
    </AppScreen>
  );
}
