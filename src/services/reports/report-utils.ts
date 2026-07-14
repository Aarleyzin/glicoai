import type { GlucoseReading } from '../../features/glucose/glucose-types';
import { formatAverageForPreference, formatReadingValueForPreference } from '../../features/glucose/glucose-presenters';
import { convertToMgDl } from '../../features/glucose/glucose-utils';
import type { ReportPeriodSelection, ReportPreview, ReportSummary, ReportUserContext } from './report-types';

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function endOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
}

function formatDateIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function validateReportPeriodSelection(selection: ReportPeriodSelection) {
  if (selection.preset !== 'custom') {
    return null;
  }

  if (!selection.startDate || !selection.endDate) {
    return 'Preencha a data inicial e final no formato AAAA-MM-DD.';
  }

  const startDate = new Date(`${selection.startDate}T00:00:00`);
  const endDate = new Date(`${selection.endDate}T23:59:59`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 'Use datas válidas no formato AAAA-MM-DD.';
  }

  if (startDate > endDate) {
    return 'A data inicial precisa ser anterior ou igual à data final.';
  }

  return null;
}

export function getDefaultCustomReportRange() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);

  return {
    startDate: formatDateIso(startDate),
    endDate: formatDateIso(endDate),
  };
}

export function filterReadingsForReport(readings: GlucoseReading[], selection: ReportPeriodSelection) {
  const sortedReadings = [...readings].sort(
    (left, right) => new Date(right.measuredAt).getTime() - new Date(left.measuredAt).getTime()
  );

  if (selection.preset === 'custom') {
    const validationError = validateReportPeriodSelection(selection);

    if (validationError) {
      return [];
    }

    const startDate = startOfDay(new Date(`${selection.startDate}T00:00:00`));
    const endDate = endOfDay(new Date(`${selection.endDate}T00:00:00`));

    return sortedReadings.filter((reading) => {
      const measuredAt = new Date(reading.measuredAt);
      return measuredAt >= startDate && measuredAt <= endDate;
    });
  }

  const startDate = startOfDay(new Date());
  startDate.setDate(startDate.getDate() - (selection.preset - 1));

  return sortedReadings.filter((reading) => new Date(reading.measuredAt) >= startDate);
}

export function getReportPeriodLabel(selection: ReportPeriodSelection) {
  if (selection.preset === 'custom') {
    if (!selection.startDate || !selection.endDate) {
      return 'Período personalizado';
    }

    return `${formatDisplayDate(selection.startDate)} a ${formatDisplayDate(selection.endDate)}`;
  }

  return `Últimos ${selection.preset} dias`;
}

export function buildReportSummary(readings: GlucoseReading[], context: ReportUserContext): ReportSummary {
  if (!readings.length) {
    return {
      averageMgDl: null,
      highestReading: null,
      lowestReading: null,
      timeInRange: 0,
      totalReadings: 0,
    };
  }

  const normalizedReadings = readings.map((reading) => ({
    reading,
    valueMgDl: convertToMgDl(reading.value, reading.unit),
  }));

  const totalValue = normalizedReadings.reduce((sum, item) => sum + item.valueMgDl, 0);
  const averageMgDl = Math.round(totalValue / normalizedReadings.length);
  const highestReading = normalizedReadings.reduce((highest, item) =>
    item.valueMgDl > highest.valueMgDl ? item : highest
  ).reading;
  const lowestReading = normalizedReadings.reduce((lowest, item) =>
    item.valueMgDl < lowest.valueMgDl ? item : lowest
  ).reading;
  const inRangeCount = normalizedReadings.filter(
    (item) => item.valueMgDl >= context.targetRange.min && item.valueMgDl <= context.targetRange.max
  ).length;

  return {
    averageMgDl,
    highestReading,
    lowestReading,
    timeInRange: Math.round((inRangeCount / normalizedReadings.length) * 100),
    totalReadings: readings.length,
  };
}

export function buildReportPreview(
  readings: GlucoseReading[],
  selection: ReportPeriodSelection,
  context: ReportUserContext
): ReportPreview {
  const filteredReadings = filterReadingsForReport(readings, selection);

  return {
    generatedAt: new Date().toISOString(),
    periodLabel: getReportPeriodLabel(selection),
    readings: filteredReadings,
    summary: buildReportSummary(filteredReadings, context),
  };
}

export function formatDisplayDate(dateLike: string) {
  const date = new Date(`${dateLike.slice(0, 10)}T00:00:00`);

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDisplayDateTime(dateLike: string) {
  const date = new Date(dateLike);

  return {
    date: date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export function formatSummaryValue(valueMgDl: number | null, unitPreference: ReportUserContext['unitPreference']) {
  return `${formatAverageForPreference(valueMgDl, unitPreference)} ${unitPreference}`;
}

export function formatReadingForReport(reading: GlucoseReading, unitPreference: ReportUserContext['unitPreference']) {
  return `${formatReadingValueForPreference(reading.value, reading.unit, unitPreference)} ${unitPreference}`;
}

export function buildReportInsight(preview: ReportPreview, context: ReportUserContext) {
  if (!preview.readings.length) {
    return 'Ainda não há medições suficientes nesse período para montar um resumo para consulta.';
  }

  return `Você registrou ${preview.summary.totalReadings} medições em ${preview.periodLabel.toLowerCase()}, com média de ${formatSummaryValue(
    preview.summary.averageMgDl,
    context.unitPreference
  )} e ${preview.summary.timeInRange}% dentro da sua faixa alvo.`;
}
