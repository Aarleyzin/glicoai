import { FontAwesome5 } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, View } from 'react-native';

import { AppButton, AppCard, AppChip, AppLoadingState, AppScreen, AppText } from '../../src/components';
import { spacing } from '../../src/constants';
import type { GlucoseContext, GlucoseReading, GlucoseStatus, GlucoseUnit } from '../../src/features/glucose/glucose-types';
import { formatAverageForPreference, formatGlucoseContextLabel, formatGlucoseStatusLabel, formatReadingValueForPreference } from '../../src/features/glucose/glucose-presenters';
import { convertToMgDl, formatReadingDate, formatReadingTime } from '../../src/features/glucose/glucose-utils';
import { getLockedFeatureMessage } from '../../src/services/subscriptions/feature-gates';
import { useAppSettingsStore } from '../../src/stores/app-settings-store';
import { useGlucoseStore } from '../../src/stores/glucose-store';
import { useSubscriptionStore } from '../../src/stores/subscription-store';
import { useAppTheme } from '../../src/theme/app-theme';

const periods = [
  { label: 'Hoje', value: 'today' as const },
  { label: '7 dias', value: 7 as const },
  { label: '30 dias', value: 30 as const },
  { label: '90 dias', value: 90 as const },
];
const statuses: Array<{ label: string; value: 'all' | GlucoseStatus }> = [
  { label: 'Todos', value: 'all' }, { label: 'Baixa', value: 'Baixa' }, { label: 'No alvo', value: 'Dentro do alvo' },
  { label: 'Alta', value: 'Alta' }, { label: 'Atenção', value: 'Atenção' },
];
const contexts: Array<{ label: string; value: 'all' | GlucoseContext }> = [
  { label: 'Todos', value: 'all' }, { label: 'Jejum', value: 'Jejum' }, { label: 'Antes da refeição', value: 'Antes da refeição' },
  { label: 'Após refeição', value: 'Após refeição' }, { label: 'Antes de dormir', value: 'Antes de dormir' },
  { label: 'Após exercício', value: 'Após exercício' }, { label: 'Mal-estar', value: 'Mal-estar' },
];

function FilterStrip<T extends string | number>({ options, value, onChange }: { options: Array<{ label: string; value: T }>; value: T; onChange: (value: T) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs, paddingRight: spacing.lg }}>
      {options.map((option) => <AppChip key={option.label} label={option.label} selected={value === option.value} onPress={() => onChange(option.value)} />)}
    </ScrollView>
  );
}

function SummaryRow({ label, value, separator = true }: { label: string; value: string; separator?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ alignItems: 'center', borderBottomColor: colors.separator, borderBottomWidth: separator ? 1 : 0, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md }}>
      <AppText variant="body" tone="muted">{label}</AppText>
      <AppText variant="subtitle" weight="bold" style={{ fontVariant: ['tabular-nums'] }}>{value}</AppText>
    </View>
  );
}

function ReadingRow({ reading, unit, separator, onPress }: { reading: GlucoseReading; unit: GlucoseUnit; separator: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  const statusColor = reading.status === 'Dentro do alvo' ? colors.success : reading.status === 'Baixa' ? colors.danger : colors.warning;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ alignItems: 'center', borderBottomColor: colors.separator, borderBottomWidth: separator ? 1 : 0, flexDirection: 'row', gap: spacing.md, opacity: pressed ? 0.55 : 1, paddingVertical: spacing.md })}>
      <View style={{ backgroundColor: statusColor, borderRadius: 999, height: 9, width: 9 }} />
      <View style={{ flex: 1, gap: spacing.xxs }}>
        <AppText variant="body" weight="semibold">{formatGlucoseContextLabel(reading.context)}</AppText>
        <AppText variant="caption" tone="muted">{formatReadingDate(reading.measuredAt)} · {formatReadingTime(reading.measuredAt)} · {formatGlucoseStatusLabel(reading.status)}</AppText>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <AppText variant="subtitle" weight="bold" style={{ fontVariant: ['tabular-nums'] }}>{formatReadingValueForPreference(reading.value, reading.unit, unit)}</AppText>
        <AppText variant="caption" tone="muted">{unit}</AppText>
      </View>
      <FontAwesome5 color={colors.tertiaryText} name="chevron-right" size={12} solid />
    </Pressable>
  );
}

export default function HistoryScreen() {
  const [period, setPeriod] = useState<(typeof periods)[number]['value']>('today');
  const [status, setStatus] = useState<(typeof statuses)[number]['value']>('all');
  const [context, setContext] = useState<(typeof contexts)[number]['value']>('all');
  const [selected, setSelected] = useState<GlucoseReading | null>(null);
  const hasHydrated = useGlucoseStore((state) => state.hasHydrated);
  const unit = useAppSettingsStore((state) => state.unitPreference);
  const deleteReading = useGlucoseStore((state) => state.deleteReading);
  const getReadingsByPeriod = useGlucoseStore((state) => state.getReadingsByPeriod);
  const canViewFullHistory = useSubscriptionStore((state) => state.gates.canViewFullHistory);
  const { colors } = useAppTheme();

  const filtered = useMemo(() => getReadingsByPeriod(period).filter((reading) => {
    const matchesStatus = status === 'all' || formatGlucoseStatusLabel(reading.status) === status;
    const matchesContext = context === 'all' || formatGlucoseContextLabel(reading.context) === context;
    return matchesStatus && matchesContext;
  }), [context, getReadingsByPeriod, period, status]);

  const summary = useMemo(() => {
    if (!filtered.length) return { average: null as number | null, inRange: 0 };
    const total = filtered.reduce((sum, reading) => sum + convertToMgDl(reading.value, reading.unit), 0);
    return {
      average: Math.round(total / filtered.length),
      inRange: Math.round((filtered.filter((reading) => reading.status === 'Dentro do alvo').length / filtered.length) * 100),
    };
  }, [filtered]);

  function confirmDelete(reading: GlucoseReading) {
    Alert.alert('Excluir medição', 'Deseja excluir esta medição do histórico?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => { deleteReading(reading.id); setSelected(null); } },
    ]);
  }

  return (
    <AppScreen contentStyle={{ gap: spacing.xxl }}>
      <View style={{ gap: spacing.xs, paddingTop: spacing.sm }}>
        <AppText variant="caption" tone="muted" weight="semibold">GlicoAí</AppText>
        <AppText accessibilityRole="header" weight="bold" style={{ fontSize: 34, lineHeight: 41 }}>Histórico</AppText>
        <AppText variant="body" tone="muted">Todas as suas medições, em ordem cronológica.</AppText>
      </View>

      <View style={{ gap: spacing.md }}>
        <FilterStrip options={periods} value={period} onChange={setPeriod} />
        <FilterStrip options={statuses} value={status} onChange={setStatus} />
        <FilterStrip options={contexts} value={context} onChange={setContext} />
      </View>

      <View style={{ gap: spacing.md }}>
        <AppText variant="subtitle" weight="bold">Resumo do filtro</AppText>
        <AppCard style={{ gap: 0, paddingHorizontal: spacing.lg, paddingVertical: 0 }}>
          <SummaryRow label="Medições" value={filtered.length ? String(filtered.length) : '—'} />
          <SummaryRow label="Média" value={summary.average === null ? '—' : `${formatAverageForPreference(summary.average, unit)} ${unit}`} />
          <SummaryRow label="Dentro do alvo" value={filtered.length ? `${summary.inRange}%` : '—'} separator={false} />
        </AppCard>
        {!canViewFullHistory ? <AppText variant="caption" tone="muted">{getLockedFeatureMessage('canViewFullHistory')}</AppText> : null}
      </View>

      {!hasHydrated ? <AppLoadingState label="Carregando seu histórico" /> : filtered.length === 0 ? (
        <View style={{ gap: spacing.md, paddingVertical: spacing.xl }}>
          <FontAwesome5 color={colors.tertiaryText} name="history" size={24} solid />
          <AppText variant="title" weight="bold">Nenhuma medição encontrada</AppText>
          <AppText variant="body" tone="muted">Altere os filtros ou registre uma nova medição.</AppText>
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          <AppText variant="subtitle" weight="bold">Medições</AppText>
          <AppCard style={{ gap: 0, paddingHorizontal: spacing.lg, paddingVertical: 0 }}>
            {filtered.map((reading, index) => <ReadingRow key={reading.id} reading={reading} unit={unit} separator={index < filtered.length - 1} onPress={() => setSelected(reading)} />)}
          </AppCard>
        </View>
      )}

      <Modal animationType="fade" transparent visible={Boolean(selected)} onRequestClose={() => setSelected(null)}>
        <Pressable onPress={() => setSelected(null)} style={{ alignItems: 'center', backgroundColor: colors.overlay, flex: 1, justifyContent: 'center', padding: spacing.lg }}>
          <Pressable onPress={() => undefined} style={{ width: '100%' }}>
            {selected ? (
              <AppCard style={{ gap: spacing.xl, padding: spacing.xl }}>
                <View style={{ gap: spacing.xs }}>
                  <AppText variant="caption" tone="muted">{formatGlucoseStatusLabel(selected.status)}</AppText>
                  <View style={{ alignItems: 'baseline', flexDirection: 'row', gap: spacing.sm }}>
                    <AppText weight="bold" style={{ fontSize: 48, fontVariant: ['tabular-nums'], lineHeight: 56 }}>{formatReadingValueForPreference(selected.value, selected.unit, unit)}</AppText>
                    <AppText variant="subtitle" tone="muted">{unit}</AppText>
                  </View>
                </View>
                <View style={{ gap: spacing.sm }}>
                  <AppText variant="body">{formatGlucoseContextLabel(selected.context)} · {formatReadingDate(selected.measuredAt)} · {formatReadingTime(selected.measuredAt)}</AppText>
                  <AppText variant="body" tone="muted">Sentimento: {selected.mood}</AppText>
                  <AppText variant="body" tone="muted">{selected.note || 'Sem observação.'}</AppText>
                </View>
                <View style={{ gap: spacing.sm }}>
                  <AppButton title="Fechar" variant="secondary" onPress={() => setSelected(null)} />
                  <AppButton title="Excluir medição" variant="danger" onPress={() => confirmDelete(selected)} />
                </View>
              </AppCard>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </AppScreen>
  );
}