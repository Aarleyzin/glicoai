import { Link } from 'expo-router';
import { Image, View } from 'react-native';

import { AppButton, AppCard, AppLoadingState, AppScreen, AppText, EmptyState, ScreenHeader, StatusBadge } from '../src/components';
import { appMascot, spacing } from '../src/constants';
import {
  formatGlucoseContextLabel,
  formatGlucoseStatusLabel,
  formatReadingValueForPreference,
  getStatusBadgeTone,
} from '../src/features/glucose/glucose-presenters';
import { formatReadingDate, formatReadingTime } from '../src/features/glucose/glucose-utils';
import { useAppSettingsStore } from '../src/stores/app-settings-store';
import { useGlucoseStore } from '../src/stores/glucose-store';

export default function MeasurementResultScreen() {
  const latestReading = useGlucoseStore((state) => state.readings[0]);
  const hasHydrated = useGlucoseStore((state) => state.hasHydrated);
  const unitPreference = useAppSettingsStore((state) => state.unitPreference);

  if (!hasHydrated) {
    return (
      <AppScreen>
        <AppLoadingState label="Restaurando sua última medição" />
      </AppScreen>
    );
  }

  if (!latestReading) {
    return (
      <AppScreen>
        <EmptyState
          title="Nenhuma medição encontrada"
          message="Assim que você salvar uma medição, o resultado aparecerá aqui."
          icon={<Image source={appMascot.curious} style={{ height: 80, resizeMode: 'contain', width: 80 }} />}
        />
      </AppScreen>
    );
  }

  const isInRange = latestReading.status === 'Dentro do alvo';
  const needsCare = !isInRange;
  const resultMascot =
    latestReading.status === 'Dentro do alvo'
      ? appMascot.celebrating
      : latestReading.status === 'Baixa'
        ? appMascot.worried
        : appMascot.encouraging;
  const resultCopy = isInRange
    ? {
        eyebrow: 'Tudo certo',
        title: 'Continue assim!',
        body:
          'Manter hábitos equilibrados faz toda diferença. Continue registrando contexto e rotina para entender sua evolução com mais clareza.',
      }
    : latestReading.status === 'Baixa'
      ? {
          eyebrow: 'Atenção ao cuidado',
          title: 'Atenção: glicose baixa',
          body:
            'Sua medição ficou abaixo da faixa alvo configurada. Se você tiver sintomas, se sentir mal ou o valor continuar baixo, procure orientação de um profissional de saúde.',
        }
      : latestReading.status === 'Atenção'
        ? {
            eyebrow: 'Atenção ao cuidado',
            title: 'Valor muito acima da faixa',
            body:
              'Sua medição ficou bem acima da faixa alvo configurada. Se houver sintomas, mal-estar ou dúvida clínica, procure orientação de um profissional de saúde.',
          }
        : {
            eyebrow: 'Atenção ao cuidado',
            title: 'Valor acima da faixa',
            body:
              'Sua medição ficou acima da faixa alvo configurada. Acompanhe os próximos registros e converse com um profissional de saúde se isso se repetir ou se houver sintomas.',
          };

  return (
    <AppScreen contentStyle={{ gap: spacing.xxl }}>
      <ScreenHeader title="Resultado" subtitle="Medição salva." eyebrow={resultCopy.eyebrow} />

      <AppCard tone={latestReading.status === 'Baixa' ? 'coral' : 'white'} style={{ alignItems: 'center', gap: spacing.xl, padding: spacing.xl }}>
        <Image
          source={resultMascot}
          style={{ height: 88, resizeMode: 'contain', width: 88 }}
        />

        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: spacing.xs }}>
            <AppText weight="bold" style={{ fontSize: 68, fontVariant: ['tabular-nums'], lineHeight: 76 }}>
              {formatReadingValueForPreference(latestReading.value, latestReading.unit, unitPreference)}
            </AppText>
            <AppText variant="subtitle" tone="muted" style={{ paddingBottom: spacing.sm }}>
              {unitPreference}
            </AppText>
          </View>

          <StatusBadge
            label={isInRange ? 'Dentro do seu alvo' : formatGlucoseStatusLabel(latestReading.status)}
            tone={getStatusBadgeTone(latestReading.status)}
          />
        </View>

        {needsCare ? (
          <AppText align="center" variant="caption" tone={latestReading.status === 'Baixa' ? 'danger' : 'warning'} weight="semibold">
            Procure orientação médica se houver sintomas, mal-estar ou dúvidas clínicas.
          </AppText>
        ) : null}
      </AppCard>

      <AppCard tone="white">
        <AppText variant="subtitle">Detalhes da medição</AppText>
        <View style={{ gap: spacing.sm }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="caption" tone="muted">
              Contexto
            </AppText>
            <AppText variant="body">{formatGlucoseContextLabel(latestReading.context)}</AppText>
          </View>

          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="caption" tone="muted">
              Sentimento
            </AppText>
            <AppText variant="body">{latestReading.mood}</AppText>
          </View>

          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="caption" tone="muted">
              Horário
            </AppText>
            <AppText variant="body">
              {formatReadingDate(latestReading.measuredAt)} • {formatReadingTime(latestReading.measuredAt)}
            </AppText>
          </View>

          <View style={{ gap: spacing.xxs }}>
            <AppText variant="caption" tone="muted">
              Observação
            </AppText>
            <AppText variant="body">{latestReading.note || 'Sem observação.'}</AppText>
          </View>
        </View>
      </AppCard>

      <AppCard tone={isInRange ? 'lavender' : 'cream'}>
        <AppText variant="subtitle">{resultCopy.title}</AppText>
        <AppText variant="body" tone="muted">
          {resultCopy.body}
        </AppText>
      </AppCard>

      <View style={{ gap: spacing.md }}>
        <Link asChild href="/(tabs)/history">
          <AppButton title="Ver histórico" variant="secondary" />
        </Link>
        <Link asChild href="/(tabs)/add-measurement">
          <AppButton title="Adicionar nova medição" />
        </Link>
      </View>
    </AppScreen>
  );
}

