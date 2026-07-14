import { FontAwesome5 } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppCard, AppLoadingState, AppScreen, AppText } from '../../src/components';
import { spacing } from '../../src/constants';
import { buildProgressInsight, formatAverageForPreference, formatGlucoseContextLabel, formatReadingValueForPreference } from '../../src/features/glucose/glucose-presenters';
import { convertGlucoseValue, convertToMgDl, formatReadingDate, formatReadingTime } from '../../src/features/glucose/glucose-utils';
import type { GlucoseReading, GlucoseUnit } from '../../src/features/glucose/glucose-types';
import { useAppSettingsStore } from '../../src/stores/app-settings-store';
import { getReadingExtremes, useGlucoseStore } from '../../src/stores/glucose-store';
import { useAppTheme } from '../../src/theme/app-theme';

const periods = [7, 30, 90] as const;
type Period = (typeof periods)[number];

function PeriodControl({ value, onChange }: { value: Period; onChange: (period: Period) => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ backgroundColor: colors.secondarySurface, borderCurve: 'continuous', borderRadius: 14, flexDirection: 'row', padding: 3 }}>
      {periods.map((period) => {
        const selected = value === period;
        return (
          <Pressable key={period} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => onChange(period)}
            style={({ pressed }) => ({ alignItems: 'center', backgroundColor: selected ? colors.surface : 'transparent', borderCurve: 'continuous', borderRadius: 11, flex: 1, opacity: pressed ? 0.65 : 1, paddingVertical: spacing.sm })}>
            <AppText variant="label" tone={selected ? 'default' : 'muted'} weight={selected ? 'bold' : 'medium'}>{period} dias</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function TrendChart({ readings, unit }: { readings: GlucoseReading[]; unit: GlucoseUnit }) {
  const { colors } = useAppTheme();
  const points = useMemo(() => readings.slice(0, 12).reverse().map((reading) => ({
    id: reading.id,
    value: convertGlucoseValue(reading.value, reading.unit, unit),
  })), [readings, unit]);
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const range = Math.max(Math.max(...values) - min, 1);

  return (
    <View accessibilityLabel="Gráfico da evolução da glicose" style={{ gap: spacing.sm }}>
      <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 5, height: 112 }}>
        {points.map((point) => (
          <View key={point.id} style={{ backgroundColor: colors.accent, borderRadius: 4, flex: 1, height: 24 + ((point.value - min) / range) * 88, minWidth: 5, opacity: 0.88 }} />
        ))}
      </View>
      <View style={{ borderTopColor: colors.separator, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm }}>
        <AppText variant="caption" tone="muted">Mais antigo</AppText>
        <AppText variant="caption" tone="muted">Mais recente</AppText>
      </View>
    </View>
  );
}

function MetricRow({ label, value, detail, separator = true }: { label: string; value: string; detail: string; separator?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ borderBottomColor: colors.separator, borderBottomWidth: separator ? 1 : 0, gap: spacing.xs, paddingVertical: spacing.md }}>
      <View style={{ alignItems: 'baseline', flexDirection: 'row', gap: spacing.lg, justifyContent: 'space-between' }}>
        <AppText variant="body" weight="semibold">{label}</AppText>
        <AppText variant="subtitle" weight="bold" style={{ fontVariant: ['tabular-nums'] }}>{value}</AppText>
      </View>
      <AppText variant="caption" tone="muted">{detail}</AppText>
    </View>
  );
}

function ReadingRow({ reading, unit, separator }: { reading: GlucoseReading; unit: GlucoseUnit; separator: boolean }) {
  const { colors } = useAppTheme();
  const statusColor = reading.status === 'Dentro do alvo' ? colors.success : reading.status === 'Baixa' ? colors.danger : colors.warning;
  return (
    <View style={{ alignItems: 'center', borderBottomColor: colors.separator, borderBottomWidth: separator ? 1 : 0, flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md }}>
      <View style={{ backgroundColor: statusColor, borderRadius: 999, height: 8, width: 8 }} />
      <View style={{ flex: 1, gap: spacing.xxs }}>
        <AppText variant="body" weight="semibold">{formatGlucoseContextLabel(reading.context)}</AppText>
        <AppText variant="caption" tone="muted">{formatReadingDate(reading.measuredAt)} · {formatReadingTime(reading.measuredAt)}</AppText>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <AppText variant="subtitle" weight="bold" style={{ fontVariant: ['tabular-nums'] }}>{formatReadingValueForPreference(reading.value, reading.unit, unit)}</AppText>
        <AppText variant="caption" tone="muted">{unit}</AppText>
      </View>
    </View>
  );
}

export default function InsightsScreen() {
  const [period, setPeriod] = useState<Period>(7);
  const unit = useAppSettingsStore((state) => state.unitPreference);
  const hasHydrated = useGlucoseStore((state) => state.hasHydrated);
  const getReadingsByPeriod = useGlucoseStore((state) => state.getReadingsByPeriod);
  const getTimeInRange = useGlucoseStore((state) => state.getTimeInRange);
  const readings = getReadingsByPeriod(period);
  const timeInRange = getTimeInRange(period);
  const average = readings.length ? Math.round(readings.reduce((sum, reading) => sum + convertToMgDl(reading.value, reading.unit), 0) / readings.length) : null;
  const { min, max } = getReadingExtremes(readings);
  const insight = buildProgressInsight(readings, average, timeInRange, unit);
  const { colors } = useAppTheme();

  return (
    <AppScreen contentStyle={{ gap: spacing.xxl }}>
      <View style={{ gap: spacing.xs, paddingTop: spacing.sm }}>
        <AppText variant="caption" tone="muted" weight="semibold">GlicoAí</AppText>
        <AppText accessibilityRole="header" weight="bold" style={{ fontSize: 34, lineHeight: 41 }}>Progresso</AppText>
        <AppText variant="body" tone="muted">Tendências dos seus registros ao longo do tempo.</AppText>
      </View>
      <PeriodControl value={period} onChange={setPeriod} />

      {!hasHydrated ? <AppLoadingState label="Carregando sua evolução" /> : readings.length === 0 ? (
        <AppCard style={{ gap: spacing.lg, padding: spacing.xl }}>
          <FontAwesome5 color={colors.tertiaryText} name="chart-line" size={24} solid />
          <AppText variant="title" weight="bold">Ainda não há dados suficientes</AppText>
          <AppText variant="body" tone="muted">Registre algumas medições para visualizar tendências e tempo no alvo.</AppText>
        </AppCard>
      ) : (
        <>
          <View style={{ gap: spacing.md }}>
            <AppText variant="subtitle" weight="bold">Média de glicose</AppText>
            <AppCard style={{ gap: spacing.xl, padding: spacing.xl }}>
              <View style={{ alignItems: 'baseline', flexDirection: 'row', gap: spacing.sm }}>
                <AppText weight="bold" style={{ fontSize: 56, fontVariant: ['tabular-nums'], lineHeight: 64 }}>{formatAverageForPreference(average, unit)}</AppText>
                <AppText variant="subtitle" tone="muted">{unit}</AppText>
              </View>
              <TrendChart readings={readings} unit={unit} />
            </AppCard>
          </View>

          <View style={{ gap: spacing.md }}>
            <AppText variant="subtitle" weight="bold">Visão do período</AppText>
            <AppCard style={{ gap: 0, paddingHorizontal: spacing.lg, paddingVertical: 0 }}>
              <MetricRow label="Tempo no alvo" value={`${timeInRange}%`} detail={`${readings.length} medições nos últimos ${period} dias`} />
              <MetricRow label="Maior valor" value={max ? `${formatReadingValueForPreference(max.value, max.unit, unit)} ${unit}` : '—'} detail={max ? formatGlucoseContextLabel(max.context) : 'Sem dados'} />
              <MetricRow label="Menor valor" value={min ? `${formatReadingValueForPreference(min.value, min.unit, unit)} ${unit}` : '—'} detail={min ? formatGlucoseContextLabel(min.context) : 'Sem dados'} separator={false} />
            </AppCard>
          </View>

          <View style={{ gap: spacing.md }}>
            <AppText variant="subtitle" weight="bold">Insight do período</AppText>
            <View style={{ borderLeftColor: colors.accent, borderLeftWidth: 3, gap: spacing.sm, paddingLeft: spacing.lg, paddingVertical: spacing.xs }}>
              <AppText variant="body">{insight}</AppText>
              <AppText variant="caption" tone="muted">Os dados mostram tendências dos seus registros e não substituem orientação médica.</AppText>
            </View>
          </View>

          <View style={{ gap: spacing.md }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="subtitle" weight="bold">Histórico recente</AppText>
              <Link href="/(tabs)/history"><AppText variant="label" style={{ color: colors.accent }}>Ver todas</AppText></Link>
            </View>
            <AppCard style={{ gap: 0, paddingHorizontal: spacing.lg, paddingVertical: 0 }}>
              {readings.slice(0, 3).map((reading, index) => <ReadingRow key={reading.id} reading={reading} unit={unit} separator={index < Math.min(readings.length, 3) - 1} />)}
            </AppCard>
          </View>
        </>
      )}
    </AppScreen>
  );
}