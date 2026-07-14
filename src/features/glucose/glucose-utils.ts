import { mockReadings } from '../../data/mock-data';
import type { TargetRange } from '../profile/profile-types';
import type { AddGlucoseReadingInput, GlucoseReading, GlucoseStatus, GlucoseUnit } from './glucose-types';

export const DEFAULT_TARGET_RANGE = {
  min: 70,
  max: 180,
} as const;

export function convertToMgDl(value: number, unit: GlucoseUnit) {
  return unit === 'mmol/L' ? value * 18 : value;
}

export function convertFromMgDl(value: number, unit: GlucoseUnit) {
  return unit === 'mmol/L' ? value / 18 : value;
}

export function convertGlucoseValue(value: number, fromUnit: GlucoseUnit, toUnit: GlucoseUnit) {
  if (fromUnit === toUnit) {
    return value;
  }

  return toUnit === 'mg/dL' ? convertToMgDl(value, fromUnit) : convertFromMgDl(value, fromUnit);
}

export function getGlucoseStatus(
  value: number,
  unit: GlucoseUnit,
  targetRange: Pick<TargetRange, 'min' | 'max'> = DEFAULT_TARGET_RANGE
): GlucoseStatus {
  const normalizedValue = convertToMgDl(value, unit);
  const upperHighThreshold = targetRange.max + 70;

  if (normalizedValue < targetRange.min) {
    return 'Baixa';
  }

  if (normalizedValue <= targetRange.max) {
    return 'Dentro do alvo';
  }

  if (normalizedValue <= upperHighThreshold) {
    return 'Alta';
  }

  return 'Atenção';
}

export function createReadingFromInput(
  input: AddGlucoseReadingInput,
  targetRange: Pick<TargetRange, 'min' | 'max'> = DEFAULT_TARGET_RANGE
) {
  const measuredAt = input.measuredAt ?? new Date().toISOString();

  return {
    id: createReadingId(),
    value: input.value,
    unit: input.unit,
    measuredAt,
    context: input.context,
    mood: input.mood,
    note: input.note?.trim() ?? '',
    status: getGlucoseStatus(input.value, input.unit, targetRange),
    createdAt: new Date().toISOString(),
  };
}

export function createSeedReadings() {
  return mockReadings.map((reading, index) => {
    const measuredAt = createSeedDate(index);

    return {
      id: reading.id,
      value: reading.value,
      unit: 'mg/dL' as const,
      measuredAt,
      context: normalizeSeedContext(reading.context),
      mood: normalizeSeedMood(index),
      note: reading.note,
      status: getGlucoseStatus(reading.value, 'mg/dL'),
      createdAt: measuredAt,
    } satisfies GlucoseReading;
  });
}

export function isSameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export function getReadingsSinceDays<T extends { measuredAt: string }>(readings: T[], days: number) {
  const now = new Date();
  const threshold = new Date(now);
  threshold.setHours(0, 0, 0, 0);
  threshold.setDate(threshold.getDate() - (days - 1));

  return readings.filter((reading) => new Date(reading.measuredAt) >= threshold);
}

export function formatReadingDate(dateIso: string) {
  const date = new Date(dateIso);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) {
    return 'Hoje';
  }

  if (isSameDay(date, yesterday)) {
    return 'Ontem';
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function formatReadingTime(dateIso: string) {
  return new Date(dateIso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function createReadingId() {
  return `reading-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createSeedDate(index: number) {
  const date = new Date();

  if (index === 0) {
    date.setHours(8, 10, 0, 0);
  }

  if (index === 1) {
    date.setDate(date.getDate() - 1);
    date.setHours(12, 45, 0, 0);
  }

  if (index === 2) {
    date.setDate(date.getDate() - 1);
    date.setHours(22, 18, 0, 0);
  }

  if (index === 3) {
    date.setDate(date.getDate() - 3);
    date.setHours(7, 12, 0, 0);
  }

  return date.toISOString();
}

function normalizeSeedContext(context: string) {
  if (context === 'Apos refeicao' || context === 'Após refeição') {
    return 'Após refeição' as const;
  }

  if (context === 'Antes de dormir') {
    return 'Antes de dormir' as const;
  }

  if (context === 'Jejum') {
    return 'Jejum' as const;
  }

  return 'Agora' as const;
}

function normalizeSeedMood(index: number) {
  const moods = ['Bem', 'Normal', 'Cansado', 'Bem'] as const;
  return moods[index] ?? 'Normal';
}
