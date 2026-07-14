import { FontAwesome5 } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { View } from 'react-native';

import { AppButton, AppCard, AppLoadingState, AppScreen, AppText } from '../../src/components';
import { spacing } from '../../src/constants';
import {
  formatAverageForPreference,
  formatGlucoseContextLabel,
  formatGlucoseStatusLabel,
  formatReadingValueForPreference,
} from '../../src/features/glucose/glucose-presenters';
import { formatReadingDate, formatReadingTime } from '../../src/features/glucose/glucose-utils';
import type { GlucoseReading } from '../../src/features/glucose/glucose-types';
import { useAppSettingsStore } from '../../src/stores/app-settings-store';
import { useGlucoseStore } from '../../src/stores/glucose-store';
import { useAppTheme } from '../../src/theme/app-theme';

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function SummaryRow({ label, value, detail, separator = true }: { label: string; value: string; detail: string; separator?: boolean }) {
  const { colors } = useAppTheme();

  return (
    <View style={{ borderBottomColor: colors.separator, borderBottomWidth: separator ? 1 : 0, gap: spacing.xs, paddingVertical: spacing.md }}>
      <View style={{ alignItems: 'baseline', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' }}>
        <AppText variant="body" weight="semibold">{label}</AppText>
        <AppText variant="subtitle" weight="bold" style={{ fontVariant: ['tabular-nums'] }}>{value}</AppText>
      </View>
      <AppText variant="caption" tone="muted">{detail}</AppText>
    </View>
  );
}

function ReadingRow({ reading, unit, separator }: { reading: GlucoseReading; unit: 'mg/dL' | 'mmol/L'; separator: boolean }) {
  const { colors } = useAppTheme();
  const statusColor = reading.status === 'Dentro do alvo' ? colors.success : reading.status === 'Baixa' ? colors.danger : colors.warning;

  return (
    <View style={{ alignItems: 'center', borderBottomColor: colors.separator, borderBottomWidth: separator ? 1 : 0, flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md }}>
      <View style={{ backgroundColor: statusColor, borderRadius: 999, height: 8, width: 8 }} />
      <View style={{ flex: 1, gap: spacing.xxs }}>
        <AppText variant="body" weight="semibold">{formatGlucoseContextLabel(reading.context)}</AppText>
        <AppText variant="caption" tone="muted">{formatReadingDate(reading.measuredAt)} · {formatReadingTime(reading.measuredAt)}</AppText>
      </View>
      <View style={{ alignItems: 'flex-end', gap: spacing.xxs }}>
        <AppText variant="subtitle" weight="bold" style={{ fontVariant: ['tabular-nums'] }}>
          {formatReadingValueForPreference(reading.value, reading.unit, unit)}
        </AppText>
        <AppText variant="caption" tone="muted">{unit}</AppText>
      </View>
      <FontAwesome5 color={colors.tertiaryText} name="chevron-right" size={12} solid />
    </View>
  );
}

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const unitPreference = useAppSettingsStore((state) => state.unitPreference);
  const readings = useGlucoseStore((state) => state.readings);
  const hasHydrated = useGlucoseStore((state) => state.hasHydrated);
  const hydrationError = useGlucoseStore((state) => state.hydrationError);
  const getTodayAverage = useGlucoseStore((state) => state.getTodayAverage);
  const getTimeInRange = useGlucoseStore((state) => state.getTimeInRange);
  const getReadingsByPeriod = useGlucoseStore((state) => state.getReadingsByPeriod);

  const latestReading = readings[0];
  const todayAverage = getTodayAverage();
  const todayReadings = getReadingsByPeriod('today');
  const timeInRange = getTimeInRange(7);
  const recentReadings = readings.slice(0, 3);
  const todayLabel = capitalize(new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', weekday: 'long' }).format(new Date()));
  const currentStatusColor = latestReading?.status === 'Dentro do alvo' ? colors.success : latestReading?.status === 'Baixa' ? colors.danger : colors.warning;

  return (
    <AppScreen contentStyle={{ gap: spacing.xxl }}>
      <View style={{ gap: spacing.xs, paddingTop: spacing.sm }}>
        <AppText variant="caption" tone="muted" weight="semibold">GlicoAí</AppText>
        <AppText accessibilityRole="header" weight="bold" style={{ fontSize: 34, letterSpacing: 0, lineHeight: 41 }}>Hoje</AppText>
        <AppText variant="body" tone="muted">{todayLabel}</AppText>
      </View>

      {hydrationError ? <AppText variant="body" tone="danger">{hydrationError}</AppText> : null}

      {!hasHydrated ? (
        <AppLoadingState label="Carregando suas medições" />
      ) : (
        <>
          <View style={{ gap: spacing.md }}>
            <AppText variant="subtitle" weight="bold">Glicose atual</AppText>
            <AppCard style={{ gap: spacing.xl, padding: spacing.xl }}>
              {latestReading ? (
                <>
                  <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ alignItems: 'center', flexDirection: 'row', gap: spacing.sm }}>
                      <View style={{ backgroundColor: currentStatusColor, borderRadius: 999, height: 9, width: 9 }} />
                      <AppText variant="body" weight="semibold">{formatGlucoseStatusLabel(latestReading.status)}</AppText>
                    </View>
                    <AppText variant="caption" tone="muted">Atualizado às {formatReadingTime(latestReading.measuredAt)}</AppText>
                  </View>

                  <View style={{ alignItems: 'baseline', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                    <AppText weight="bold" style={{ fontSize: 68, fontVariant: ['tabular-nums'], letterSpacing: 0, lineHeight: 76 }}>
                      {formatReadingValueForPreference(latestReading.value, latestReading.unit, unitPreference)}
                    </AppText>
                    <AppText variant="subtitle" tone="muted">{unitPreference}</AppText>
                  </View>

                  <View style={{ borderTopColor: colors.separator, borderTopWidth: 1, gap: spacing.xs, paddingTop: spacing.lg }}>
                    <AppText variant="body" weight="semibold">{formatGlucoseContextLabel(latestReading.context)}</AppText>
                    <AppText variant="caption" tone="muted">
                      {formatReadingDate(latestReading.measuredAt)}{latestReading.note ? ` · ${latestReading.note}` : ''}
                    </AppText>
                  </View>
                </>
              ) : (
                <View style={{ gap: spacing.lg, paddingVertical: spacing.md }}>
                  <View style={{ alignItems: 'center', flexDirection: 'row', gap: spacing.md }}>
                    <FontAwesome5 color={colors.accent} name="tint" size={22} solid />
                    <AppText variant="title" weight="bold">Nenhuma medição</AppText>
                  </View>
                  <AppText variant="body" tone="muted">Registre sua glicose para começar a acompanhar sua evolução.</AppText>
                </View>
              )}
            </AppCard>
            <Link asChild href="/(tabs)/add-measurement"><AppButton title="Registrar medição" /></Link>
          </View>

          <View style={{ gap: spacing.md }}>
            <AppText variant="subtitle" weight="bold">Resumo</AppText>
            <AppCard style={{ gap: 0, paddingHorizontal: spacing.lg, paddingVertical: 0 }}>
              <SummaryRow label="Média de hoje" value={todayAverage ? `${formatAverageForPreference(todayAverage, unitPreference)} ${unitPreference}` : '—'} detail="Média das leituras registradas hoje" />
              <SummaryRow label="Medições" value={todayReadings.length ? String(todayReadings.length) : '—'} detail="Registros realizados hoje" />
              <SummaryRow label="Tempo no alvo" value={readings.length ? `${timeInRange}%` : '—'} detail="Considerando os últimos 7 dias" separator={false} />
            </AppCard>
          </View>

          {recentReadings.length ? (
            <View style={{ gap: spacing.md }}>
              <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText variant="subtitle" weight="bold">Medições recentes</AppText>
                <Link href="/(tabs)/history"><AppText variant="label" style={{ color: colors.accent }}>Ver todas</AppText></Link>
              </View>
              <AppCard style={{ gap: 0, paddingHorizontal: spacing.lg, paddingVertical: 0 }}>
                {recentReadings.map((reading, index) => <ReadingRow key={reading.id} reading={reading} unit={unitPreference} separator={index < recentReadings.length - 1} />)}
              </AppCard>
            </View>
          ) : null}
        </>
      )}
    </AppScreen>
  );
}
