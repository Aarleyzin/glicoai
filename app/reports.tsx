import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import {
  AppButton,
  AppCard,
  AppChip,
  AppInput,
  AppScreen,
  AppText,
  EmptyState,
  MetricCard,
  ScreenHeader,
  StatusBadge,
} from '../src/components';
import { spacing } from '../src/constants';
import {
  formatAverageForPreference,
  formatGlucoseStatusLabel,
  formatReadingValueForPreference,
} from '../src/features/glucose/glucose-presenters';
import { useAppSettingsStore } from '../src/stores/app-settings-store';
import { useGlucoseStore } from '../src/stores/glucose-store';
import {
  createReportPreview,
  generateReportPdf,
  getReportCapabilities,
  shareReportPdf,
} from '../src/services/reports/report-service';
import type { GeneratedReportFile, ReportPeriodPreset } from '../src/services/reports/report-types';
import {
  buildReportInsight,
  formatDisplayDateTime,
  getDefaultCustomReportRange,
  validateReportPeriodSelection,
} from '../src/services/reports/report-utils';
import { useReportsStore } from '../src/stores/reports-store';
import { getLockedFeatureMessage } from '../src/services/subscriptions/feature-gates';
import { useSubscriptionStore } from '../src/stores/subscription-store';

const reportPeriodOptions: Array<{ label: string; value: ReportPeriodPreset }> = [
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
  { label: '90 dias', value: 90 },
  { label: 'Personalizado', value: 'custom' },
];

export default function ReportsScreen() {
  const router = useRouter();
  const readings = useGlucoseStore((state) => state.readings);
  const unitPreference = useAppSettingsStore((state) => state.unitPreference);
  const targetRange = useAppSettingsStore((state) => state.targetRange);
  const userName = useAppSettingsStore((state) => state.healthProfile.name.trim() || 'Camila');
  const addReport = useReportsStore((state) => state.addReport);
  const reportsHydrationError = useReportsStore((state) => state.hydrationError);
  const canGenerateReports = useSubscriptionStore((state) => state.gates.canGenerateReports);

  const [selectedPreset, setSelectedPreset] = useState<ReportPeriodPreset>(30);
  const [customRange, setCustomRange] = useState(() => getDefaultCustomReportRange());
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [periodError, setPeriodError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [generatedFile, setGeneratedFile] = useState<GeneratedReportFile | null>(null);
  const [capabilities, setCapabilities] = useState({
    canGeneratePdf: true,
    canShare: false,
    isWeb: false,
  });

  useEffect(() => {
    void getReportCapabilities().then(setCapabilities);
  }, []);

  const selection = useMemo(
    () => ({
      preset: selectedPreset,
      ...(selectedPreset === 'custom' ? customRange : {}),
    }),
    [customRange, selectedPreset]
  );

  const reportContext = useMemo(
    () => ({
      appName: 'GlicoAí',
      userName,
      unitPreference,
      targetRange,
    }),
    [targetRange, unitPreference, userName]
  );

  const preview = useMemo(() => createReportPreview(readings, selection, reportContext), [readings, reportContext, selection]);
  const insightText = useMemo(() => buildReportInsight(preview, reportContext), [preview, reportContext]);
  const generatedAtLabel = useMemo(() => formatDisplayDateTime(preview.generatedAt), [preview.generatedAt]);

  const highestLabel = preview.summary.highestReading
    ? formatReadingValueForPreference(
        preview.summary.highestReading.value,
        preview.summary.highestReading.unit,
        unitPreference
      )
    : '--';
  const lowestLabel = preview.summary.lowestReading
    ? formatReadingValueForPreference(
        preview.summary.lowestReading.value,
        preview.summary.lowestReading.unit,
        unitPreference
      )
    : '--';

  function validateSelection() {
    const error = validateReportPeriodSelection(selection);
    setPeriodError(error);
    return error;
  }

  async function handleGeneratePdf() {
    if (!canGenerateReports) {
      setActionMessage(getLockedFeatureMessage('canGenerateReports'));
      return;
    }

    const error = validateSelection();

    if (error) {
      return;
    }

    if (!preview.readings.length) {
      setActionMessage('Escolha um período com medições para montar o relatório.');
      return;
    }

    setIsGenerating(true);
    setActionMessage(null);

    try {
      const nextFile = await generateReportPdf({
        preview,
        context: reportContext,
      });

      setGeneratedFile(nextFile);
      const localReport = addReport({
        period: preview.periodLabel,
        fileUrl: nextFile.uri,
      });
      setActionMessage(
        `${nextFile.message} Registro local ${localReport.pendingSync ? 'preparado para sincronizar.' : 'sincronizado.'}`
      );
    } catch (generationError) {
      setActionMessage(
        generationError instanceof Error ? generationError.message : 'Não foi possível gerar o PDF agora.'
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleShareReport() {
    if (!canGenerateReports) {
      setActionMessage(getLockedFeatureMessage('canGenerateReports'));
      return;
    }

    const error = validateSelection();

    if (error) {
      return;
    }

    if (!preview.readings.length) {
      setActionMessage('Ainda não há medições nesse período para compartilhar.');
      return;
    }

    setIsSharing(true);
    setActionMessage(null);

    try {
      let fileToShare = generatedFile;

      if (!fileToShare) {
        fileToShare = await generateReportPdf({
          preview,
          context: reportContext,
        });
        setGeneratedFile(fileToShare);
        addReport({
          period: preview.periodLabel,
          fileUrl: fileToShare.uri,
        });
      }

      const shareResult = await shareReportPdf(fileToShare.uri);
      setActionMessage(shareResult.message);
    } catch (shareError) {
      setActionMessage(shareError instanceof Error ? shareError.message : 'Não foi possível compartilhar agora.');
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <AppScreen>
      <ScreenHeader
        title="Relatório para consulta"
        subtitle="Gere um resumo claro das suas medições."
        eyebrow="Compartilhamento"
      />

      {!canGenerateReports ? (
        <AppCard tone="lavender">
          <AppText variant="subtitle">Recurso Premium</AppText>
          <AppText variant="body" tone="muted">
            O preview continua disponível, mas gerar e compartilhar PDF faz parte do GlicoAí Premium.
          </AppText>
          <AppButton title="Ver Premium" variant="secondary" fullWidth={false} onPress={() => router.push('/premium')} />
        </AppCard>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {reportPeriodOptions.map((option) => (
          <AppChip
            key={option.label}
            label={option.label}
            onPress={() => {
              setSelectedPreset(option.value);
              setGeneratedFile(null);
              setActionMessage(null);
              setPeriodError(null);
            }}
            selected={selectedPreset === option.value}
          />
        ))}
      </View>

      {selectedPreset === 'custom' ? (
        <AppCard>
          <View style={{ gap: spacing.md }}>
            <AppText variant="subtitle">Período personalizado</AppText>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <AppInput
                containerStyle={{ flex: 1 }}
                helperText="AAAA-MM-DD"
                label="Data inicial"
                onChangeText={(value) => {
                  setCustomRange((currentRange) => ({ ...currentRange, startDate: value }));
                  setGeneratedFile(null);
                }}
                placeholder="2026-05-01"
                value={customRange.startDate}
              />
              <AppInput
                containerStyle={{ flex: 1 }}
                helperText="AAAA-MM-DD"
                label="Data final"
                onChangeText={(value) => {
                  setCustomRange((currentRange) => ({ ...currentRange, endDate: value }));
                  setGeneratedFile(null);
                }}
                placeholder="2026-05-31"
                value={customRange.endDate}
              />
            </View>
            <AppText variant="caption" tone="muted">
              Preencha datas válidas para incluir apenas o recorte que você quer levar para consulta.
            </AppText>
          </View>
        </AppCard>
      ) : null}

      {periodError ? (
        <AppCard tone="coral">
          <AppText variant="caption">{periodError}</AppText>
        </AppCard>
      ) : null}

      <AppCard tone="lavender">
        <View style={{ gap: spacing.xs }}>
          <AppText variant="subtitle">Preview resumido</AppText>
          <AppText variant="caption" tone="muted">
            Período: {preview.periodLabel} • Gerado em {generatedAtLabel.date} às {generatedAtLabel.time}
          </AppText>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <StatusBadge label={`${preview.summary.totalReadings} medições`} tone="lavender" />
          <StatusBadge label={`${preview.summary.timeInRange}% no alvo`} tone="success" />
          <StatusBadge label={capabilities.isWeb ? 'Modo navegador' : 'Modo app'} tone="mint" />
        </View>
      </AppCard>

      {preview.readings.length ? (
        <>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <MetricCard
              badgeLabel="Média"
              badgeTone="mint"
              helperText="Resumo do período"
              label="Média"
              valueVariant="title"
              style={{ flex: 1, minHeight: 132 }}
              unit={unitPreference}
              value={formatAverageForPreference(preview.summary.averageMgDl, unitPreference)}
            />
            <MetricCard
              badgeLabel="Volume"
              badgeTone="lavender"
              helperText="Quantidade de registros"
              label="Medições"
              valueVariant="title"
              style={{ flex: 1, minHeight: 132 }}
              value={preview.summary.totalReadings}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <MetricCard
              badgeLabel="Maior"
              badgeTone="warning"
              helperText={
                preview.summary.highestReading
                  ? formatGlucoseStatusLabel(preview.summary.highestReading.status)
                  : 'Sem pico'
              }
              label="Maior valor"
              valueVariant="title"
              style={{ flex: 1, minHeight: 132 }}
              unit={unitPreference}
              value={highestLabel}
            />
            <MetricCard
              badgeLabel="Menor"
              badgeTone="neutral"
              helperText={
                preview.summary.lowestReading
                  ? formatGlucoseStatusLabel(preview.summary.lowestReading.status)
                  : 'Sem leitura'
              }
              label="Menor valor"
              valueVariant="title"
              style={{ flex: 1, minHeight: 132 }}
              unit={unitPreference}
              value={lowestLabel}
            />
          </View>

          <MetricCard
            badgeLabel="Faixa alvo"
            badgeTone="success"
            helperText="Percentual das medições dentro do alvo configurado"
            label="Tempo no alvo"
            unit="%"
            value={preview.summary.timeInRange}
            valueVariant="title"
          />

          <AppCard tone="cream">
            <AppText variant="subtitle">Observação do relatório</AppText>
            <AppText variant="body" tone="muted">
              {insightText}
            </AppText>
            <AppText variant="caption" tone="muted">
              Este material é apenas informativo e não substitui orientação médica.
            </AppText>
          </AppCard>
        </>
      ) : (
        <EmptyState
          title="Sem medições nesse período"
          message="Quando houver registros dentro do filtro escolhido, o app monta o resumo e o PDF para consulta."
        />
      )}

      {actionMessage ? (
        <AppCard tone="white">
          <AppText variant="caption" tone="muted">
            {actionMessage}
          </AppText>
        </AppCard>
      ) : null}

      {reportsHydrationError ? (
        <AppCard tone="coral">
          <AppText variant="caption">{reportsHydrationError}</AppText>
        </AppCard>
      ) : null}

      {capabilities.isWeb ? (
        <AppCard tone="cream">
          <AppText variant="caption" tone="muted">
            No navegador, o botão de gerar abre a janela de impressão para salvar o PDF. O compartilhamento do
            arquivo fica habilitado nos builds do app.
          </AppText>
        </AppCard>
      ) : null}

      <View style={{ gap: spacing.md }}>
        <AppButton
          title={canGenerateReports ? 'Gerar PDF' : 'Gerar PDF Premium'}
          onPress={() => {
            void handleGeneratePdf();
          }}
          disabled={!preview.readings.length}
          loading={isGenerating}
        />
        <AppButton
          title="Compartilhar"
          variant="secondary"
          onPress={() => {
            void handleShareReport();
          }}
          disabled={!preview.readings.length || !capabilities.canShare || capabilities.isWeb}
          loading={isSharing}
        />
      </View>
    </AppScreen>
  );
}
