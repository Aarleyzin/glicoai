import type { StatusBadgeTone } from '../../components';
import type { GlucoseReading, GlucoseStatus, GlucoseUnit } from './glucose-types';
import { convertFromMgDl, convertGlucoseValue } from './glucose-utils';

export function formatGlucoseValue(value: number, unit: GlucoseUnit) {
  if (unit === 'mmol/L') {
    return value.toFixed(1);
  }

  return Math.round(value).toString();
}

export function formatReadingValueForPreference(value: number, readingUnit: GlucoseUnit, displayUnit: GlucoseUnit) {
  const convertedValue = convertGlucoseValue(value, readingUnit, displayUnit);
  return formatGlucoseValue(convertedValue, displayUnit);
}

export function formatAverageForPreference(valueInMgDl: number | null, displayUnit: GlucoseUnit) {
  if (valueInMgDl === null) {
    return '--';
  }

  return formatGlucoseValue(convertFromMgDl(valueInMgDl, displayUnit), displayUnit);
}

export function formatTargetRangeLabel(minMgDl: number, maxMgDl: number, displayUnit: GlucoseUnit) {
  const minValue = formatGlucoseValue(convertFromMgDl(minMgDl, displayUnit), displayUnit);
  const maxValue = formatGlucoseValue(convertFromMgDl(maxMgDl, displayUnit), displayUnit);
  return `${minValue} a ${maxValue} ${displayUnit}`;
}

export function getStatusBadgeTone(status: GlucoseStatus): StatusBadgeTone {
  if (status === 'Baixa') {
  return 'warning';
  }

  if (status === 'Dentro do alvo') {
    return 'success';
  }

  if (status === 'Alta') {
    return 'warning';
  }

  return 'danger';
}

export function formatGlucoseStatusLabel(status: string) {
  const legacyAttentionStatus = ['Aten', 'cao'].join('');

  if (status === legacyAttentionStatus) {
    return 'Atenção';
  }

  return status;
}

export function formatGlucoseContextLabel(context: string) {
  const legacyLabels: Record<string, string> = {
    'Antes da refeicao': 'Antes da refeição',
    'Apos refeicao': 'Após refeição',
    'Apos exercicio': 'Após exercício',
  };

  return legacyLabels[context] ?? context;
}

export function buildProgressInsight(
  readings: GlucoseReading[],
  average: number | null,
  timeInRange: number,
  displayUnit: GlucoseUnit
) {
  const averageLabel = formatAverageForPreference(average, displayUnit);

  if (readings.length === 0) {
    return 'Quando você registrar suas medições, vamos transformar os números em uma leitura mais clara da sua rotina.';
  }

  if (timeInRange >= 75) {
    return `Você registrou ${readings.length} medições no período e manteve ${timeInRange}% delas dentro do alvo. Isso sugere uma rotina bem consistente.`;
  }

  if (average !== null && average > 180) {
    return `Sua média no período foi ${averageLabel} ${displayUnit} e algumas medições ficaram acima do alvo. Vale observar contexto, horário e padrões das refeições.`;
  }

  return `Você registrou ${readings.length} medições no período. Continue acompanhando para entender melhor o que influencia suas variações.`;
}
