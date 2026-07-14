import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import type { GlucoseReading } from '../../features/glucose/glucose-types';
import {
  formatGlucoseContextLabel,
  formatGlucoseStatusLabel,
  formatTargetRangeLabel,
} from '../../features/glucose/glucose-presenters';
import type { GeneratedReportFile, ReportDocumentInput, ReportPeriodSelection, ReportPreview, ReportUserContext } from './report-types';
import {
  buildReportInsight,
  buildReportPreview,
  formatDisplayDateTime,
  formatReadingForReport,
  formatSummaryValue,
} from './report-utils';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export async function getReportCapabilities() {
  const canShare = await Sharing.isAvailableAsync().catch(() => false);

  return {
    canGeneratePdf: true,
    canShare,
    isWeb: Platform.OS === 'web',
  };
}

export function createReportPreview(
  readings: GlucoseReading[],
  selection: ReportPeriodSelection,
  context: ReportUserContext
): ReportPreview {
  return buildReportPreview(readings, selection, context);
}

export function buildReportHtml({ preview, context }: ReportDocumentInput) {
  const generatedAt = formatDisplayDateTime(preview.generatedAt);
  const rangeLabel = formatTargetRangeLabel(
    context.targetRange.min,
    context.targetRange.max,
    context.unitPreference
  );
  const rows = preview.readings.length
    ? preview.readings
        .map((reading) => {
          const measuredAt = formatDisplayDateTime(reading.measuredAt);

          return `
            <tr>
              <td>${escapeHtml(measuredAt.date)}</td>
              <td>${escapeHtml(measuredAt.time)}</td>
              <td>${escapeHtml(formatReadingForReport(reading, context.unitPreference))}</td>
              <td>${escapeHtml(formatGlucoseContextLabel(reading.context))}</td>
              <td>${escapeHtml(formatGlucoseStatusLabel(reading.status))}</td>
              <td>${escapeHtml(reading.note || '-')}</td>
            </tr>
          `;
        })
        .join('')
    : `
      <tr>
        <td colspan="6" style="text-align:center; color:#7A7D9C;">Nenhuma medição encontrada nesse período.</td>
      </tr>
    `;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Relatório GlicoAí</title>
        <style>
          body {
            background: #FFF7EF;
            color: #252B5C;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            margin: 0;
            padding: 24px;
          }
          .sheet {
            background: #FFFFFF;
            border: 1px solid rgba(37, 43, 92, 0.08);
            border-radius: 24px;
            padding: 28px;
          }
          h1, h2, h3, p {
            margin: 0;
          }
          .stack {
            display: block;
            margin-top: 20px;
          }
          .muted {
            color: #7A7D9C;
          }
          .hero {
            background: linear-gradient(135deg, #FFF0F0 0%, #E8FAF6 100%);
            border-radius: 20px;
            padding: 20px;
          }
          .metrics {
            margin-top: 20px;
            width: 100%;
          }
          .metrics td {
            padding: 12px 0;
            vertical-align: top;
          }
          .metrics td:last-child {
            text-align: right;
            font-weight: 700;
          }
          .notice {
            background: #F2EDFF;
            border-radius: 16px;
            color: #252B5C;
            margin-top: 20px;
            padding: 16px;
          }
          table {
            border-collapse: collapse;
            margin-top: 20px;
            width: 100%;
          }
          th, td {
            border-bottom: 1px solid rgba(37, 43, 92, 0.08);
            font-size: 12px;
            padding: 10px 8px;
            text-align: left;
          }
          th {
            color: #7A7D9C;
            font-weight: 600;
          }
          .footer {
            margin-top: 24px;
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="hero">
            <p class="muted" style="font-size:12px; font-weight:600;">${escapeHtml(context.appName)}</p>
            <h1 style="font-size:28px; margin-top:6px;">Relatório para consulta</h1>
            <p class="muted" style="font-size:14px; margin-top:8px;">Este relatório é apenas informativo e não substitui orientação médica.</p>
          </div>

          <div class="stack">
            <h2 style="font-size:18px;">Dados do relatório</h2>
            <table class="metrics">
              <tr><td>Nome do usuário</td><td>${escapeHtml(context.userName)}</td></tr>
              <tr><td>Período</td><td>${escapeHtml(preview.periodLabel)}</td></tr>
              <tr><td>Gerado em</td><td>${escapeHtml(`${generatedAt.date} às ${generatedAt.time}`)}</td></tr>
              <tr><td>Faixa alvo</td><td>${escapeHtml(rangeLabel)}</td></tr>
            </table>
          </div>

          <div class="stack">
            <h2 style="font-size:18px;">Resumo</h2>
            <table class="metrics">
              <tr><td>Média de glicose</td><td>${escapeHtml(formatSummaryValue(preview.summary.averageMgDl, context.unitPreference))}</td></tr>
              <tr><td>Maior valor</td><td>${escapeHtml(preview.summary.highestReading ? formatReadingForReport(preview.summary.highestReading, context.unitPreference) : '--')}</td></tr>
              <tr><td>Menor valor</td><td>${escapeHtml(preview.summary.lowestReading ? formatReadingForReport(preview.summary.lowestReading, context.unitPreference) : '--')}</td></tr>
              <tr><td>Tempo no alvo</td><td>${escapeHtml(`${preview.summary.timeInRange}%`)}</td></tr>
              <tr><td>Total de medições</td><td>${escapeHtml(String(preview.summary.totalReadings))}</td></tr>
            </table>
          </div>

          <div class="notice">
            <h3 style="font-size:15px;">Observação</h3>
            <p style="font-size:13px; margin-top:8px;">${escapeHtml(buildReportInsight(preview, context))}</p>
          </div>

          <div class="stack">
            <h2 style="font-size:18px;">Lista de medições</h2>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Hora</th>
                  <th>Valor</th>
                  <th>Contexto</th>
                  <th>Status</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <h3 style="font-size:15px;">Observações finais</h3>
            <p class="muted" style="font-size:13px; margin-top:8px;">
              Use este material como apoio para conversar sobre a sua rotina de registros com um profissional de saúde.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function generateReportPdf(input: ReportDocumentInput): Promise<GeneratedReportFile> {
  const html = buildReportHtml(input);

  if (Platform.OS === 'web') {
    await Print.printAsync({ html });

    return {
      uri: null,
      mode: 'print-dialog',
      message: 'No navegador, abrimos a janela de impressão para você salvar o PDF.',
    };
  }

  const file = await Print.printToFileAsync({
    html,
    base64: false,
  });

  return {
    uri: file.uri,
    mode: 'file',
    message: 'PDF gerado com sucesso no armazenamento temporário do app.',
  };
}

export async function shareReportPdf(fileUri: string | null) {
  if (!fileUri) {
    return {
      shared: false,
      message: 'Gere o PDF primeiro para compartilhar o arquivo.',
    };
  }

  const canShare = await Sharing.isAvailableAsync().catch(() => false);

  if (!canShare) {
    return {
      shared: false,
      message: 'O compartilhamento não está disponível neste ambiente.',
    };
  }

  await Sharing.shareAsync(fileUri, {
    UTI: 'com.adobe.pdf',
    mimeType: 'application/pdf',
    dialogTitle: 'Compartilhar relatório do GlicoAí',
  });

  return {
    shared: true,
    message: 'Relatório pronto para compartilhar.',
  };
}
