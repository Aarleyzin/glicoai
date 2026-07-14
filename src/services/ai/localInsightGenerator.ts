import { buildProgressInsight, formatAverageForPreference, formatGlucoseContextLabel, formatReadingValueForPreference, formatTargetRangeLabel } from '../../features/glucose/glucose-presenters';
import { convertToMgDl, getReadingsSinceDays } from '../../features/glucose/glucose-utils';
import { getReadingExtremes } from '../../stores/glucose-store';
import { finalizeSafeAssistantResponse, reviewAssistantPrompt } from './aiGuardrails';
import type { AssistantAnswer, AssistantContext, AssistantQuickAction, AssistantSafetyReview } from './assistant-types';

type PeriodAnalytics = {
  readings: AssistantContext['readings'];
  count: number;
  averageMgDl: number | null;
  timeInRange: number;
  inRangeCount: number;
  lowCount: number;
  highCount: number;
  attentionCount: number;
  minMgDl: number | null;
  maxMgDl: number | null;
  variabilityMgDl: number | null;
  topContext: {
    label: string;
    averageMgDl: number;
    count: number;
  } | null;
  lowestContext: {
    label: string;
    averageMgDl: number;
    count: number;
  } | null;
  topMood: string | null;
  highRiskSignal: boolean;
};

type TrendComparison = {
  averageDeltaMgDl: number | null;
  timeInRangeDelta: number;
  countDelta: number;
};

function sortReadingsByDateDesc(context: AssistantContext) {
  return [...context.readings].sort((left, right) => new Date(right.measuredAt).getTime() - new Date(left.measuredAt).getTime());
}

function getPeriodReadings(context: AssistantContext, days: number, daysOffset = 0) {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setHours(23, 59, 59, 999);
  periodEnd.setDate(periodEnd.getDate() - daysOffset);

  const periodStart = new Date(periodEnd);
  periodStart.setHours(0, 0, 0, 0);
  periodStart.setDate(periodStart.getDate() - (days - 1));

  return sortReadingsByDateDesc(context).filter((reading) => {
    const measuredAt = new Date(reading.measuredAt);
    return measuredAt >= periodStart && measuredAt <= periodEnd;
  });
}

function getAverageMgDl(readings: AssistantContext['readings']) {
  if (!readings.length) {
    return null;
  }

  const total = readings.reduce((sum, reading) => sum + convertToMgDl(reading.value, reading.unit), 0);
  return Math.round(total / readings.length);
}

function getVariabilityMgDl(readings: AssistantContext['readings']) {
  const average = getAverageMgDl(readings);

  if (average === null || readings.length < 2) {
    return null;
  }

  const squaredDiffs = readings.map((reading) => {
    const valueMgDl = convertToMgDl(reading.value, reading.unit);
    return (valueMgDl - average) ** 2;
  });

  const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / readings.length;
  return Math.round(Math.sqrt(variance));
}

function getTimeInRange(readings: AssistantContext['readings'], context: AssistantContext) {
  if (!readings.length) {
    return 0;
  }

  const inRangeCount = readings.filter((reading) => {
    const valueMgDl = convertToMgDl(reading.value, reading.unit);
    return valueMgDl >= context.targetRange.min && valueMgDl <= context.targetRange.max;
  }).length;

  return Math.round((inRangeCount / readings.length) * 100);
}

function getContextAverages(readings: AssistantContext['readings']) {
  const grouped = new Map<string, number[]>();

  readings.forEach((reading) => {
    const valueMgDl = convertToMgDl(reading.value, reading.unit);
    grouped.set(reading.context, [...(grouped.get(reading.context) ?? []), valueMgDl]);
  });

  return [...grouped.entries()]
    .map(([context, values]) => ({
      label: formatGlucoseContextLabel(context),
      averageMgDl: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
      count: values.length,
    }))
    .sort((left, right) => right.averageMgDl - left.averageMgDl);
}

function getMostFrequentMood(readings: AssistantContext['readings']) {
  const counts = new Map<string, number>();

  readings.forEach((reading) => {
    counts.set(reading.mood, (counts.get(reading.mood) ?? 0) + 1);
  });

  const rankedMoods = [...counts.entries()].sort((left, right) => right[1] - left[1]);
  return rankedMoods[0]?.[0] ?? null;
}

function analyzePeriod(readings: AssistantContext['readings'], context: AssistantContext): PeriodAnalytics {
  const averageMgDl = getAverageMgDl(readings);
  const timeInRange = getTimeInRange(readings, context);
  const contextAverages = getContextAverages(readings);
  const valuesMgDl = readings.map((reading) => convertToMgDl(reading.value, reading.unit));
  const lowCount = valuesMgDl.filter((value) => value < context.targetRange.min).length;
  const inRangeCount = valuesMgDl.filter((value) => value >= context.targetRange.min && value <= context.targetRange.max).length;
  const highCount = valuesMgDl.filter((value) => value > context.targetRange.max && value <= context.targetRange.max + 70).length;
  const attentionCount = valuesMgDl.filter((value) => value > context.targetRange.max + 70).length;

  return {
    readings,
    count: readings.length,
    averageMgDl,
    timeInRange,
    inRangeCount,
    lowCount,
    highCount,
    attentionCount,
    minMgDl: valuesMgDl.length ? Math.min(...valuesMgDl) : null,
    maxMgDl: valuesMgDl.length ? Math.max(...valuesMgDl) : null,
    variabilityMgDl: getVariabilityMgDl(readings),
    topContext: contextAverages.find((item) => item.count >= 2) ?? contextAverages[0] ?? null,
    lowestContext: [...contextAverages].reverse().find((item) => item.count >= 2) ?? [...contextAverages].reverse()[0] ?? null,
    topMood: getMostFrequentMood(readings),
    highRiskSignal: valuesMgDl.some((value) => value < 70 || value > 250),
  };
}

function comparePeriods(current: PeriodAnalytics, previous: PeriodAnalytics): TrendComparison {
  return {
    averageDeltaMgDl:
      current.averageMgDl === null || previous.averageMgDl === null ? null : current.averageMgDl - previous.averageMgDl,
    timeInRangeDelta: current.timeInRange - previous.timeInRange,
    countDelta: current.count - previous.count,
  };
}

function describeAverageTrend(comparison: TrendComparison, context: AssistantContext) {
  if (comparison.averageDeltaMgDl === null) {
    return null;
  }

  const deltaLabel = formatAverageForPreference(Math.abs(comparison.averageDeltaMgDl), context.unitPreference);

  if (Math.abs(comparison.averageDeltaMgDl) <= 8) {
    return 'A média ficou estável em relação ao período anterior.';
  }

  if (comparison.averageDeltaMgDl > 0) {
    return `A média subiu cerca de ${deltaLabel} ${context.unitPreference} em comparação com o período anterior.`;
  }

  return `A média caiu cerca de ${deltaLabel} ${context.unitPreference} em comparação com o período anterior.`;
}

function describeRangeTrend(comparison: TrendComparison) {
  if (Math.abs(comparison.timeInRangeDelta) <= 4) {
    return 'O tempo no alvo ficou bem próximo do período anterior.';
  }

  if (comparison.timeInRangeDelta > 0) {
    return `O tempo no alvo melhorou ${comparison.timeInRangeDelta} pontos percentuais.`;
  }

  return `O tempo no alvo caiu ${Math.abs(comparison.timeInRangeDelta)} pontos percentuais.`;
}

function buildNoDataFallback() {
  return finalizeSafeAssistantResponse(
    'Ainda não encontrei medições suficientes para interpretar tendências. Assim que você registrar alguns valores, eu posso resumir o período, destacar variações e sugerir perguntas para consulta.'
  );
}

function getWeeklyAnalytics(context: AssistantContext) {
  return analyzePeriod(getPeriodReadings(context, 7), context);
}

function getPreviousWeeklyAnalytics(context: AssistantContext) {
  return analyzePeriod(getPeriodReadings(context, 7, 7), context);
}

export function generateWeeklySummary(context: AssistantContext) {
  const weekly = getWeeklyAnalytics(context);

  if (!weekly.count) {
    return buildNoDataFallback();
  }

  const previousWeekly = getPreviousWeeklyAnalytics(context);
  const comparison = comparePeriods(weekly, previousWeekly);
  const averageLabel = formatAverageForPreference(weekly.averageMgDl, context.unitPreference);
  const trendSummary = previousWeekly.count ? `${describeAverageTrend(comparison, context)} ${describeRangeTrend(comparison)}` : null;
  const topContextSummary = weekly.topContext
    ? `O contexto com média mais alta foi ${weekly.topContext.label}, em torno de ${formatAverageForPreference(weekly.topContext.averageMgDl, context.unitPreference)} ${context.unitPreference}.`
    : null;

  return finalizeSafeAssistantResponse(
    `Nos últimos 7 dias, você registrou ${weekly.count} medições. A média do período foi ${averageLabel} ${context.unitPreference}, com ${weekly.timeInRange}% dentro da sua faixa alvo. ${
      trendSummary ?? ''
    } ${topContextSummary ?? ''}`.trim(),
    { includeUrgencyNote: weekly.highRiskSignal }
  );
}

export function generateNumbersMeaning(context: AssistantContext) {
  const weekly = getWeeklyAnalytics(context);

  if (!weekly.count) {
    return buildNoDataFallback();
  }

  const averageLabel = formatAverageForPreference(weekly.averageMgDl, context.unitPreference);
  const variabilityLabel =
    weekly.variabilityMgDl !== null ? formatAverageForPreference(weekly.variabilityMgDl, context.unitPreference) : null;

  const dominantPattern =
    weekly.topContext && weekly.lowestContext && weekly.topContext.label !== weekly.lowestContext.label
      ? `Entre os contextos mais frequentes, ${weekly.topContext.label} aparece acima de ${weekly.lowestContext.label}.`
      : weekly.topContext
        ? `${weekly.topContext.label} aparece como um dos contextos mais relevantes nos seus registros recentes.`
        : null;

  const outOfRangeSummary =
    weekly.lowCount || weekly.highCount || weekly.attentionCount
      ? `No período, houve ${weekly.lowCount} leitura(s) baixa(s), ${weekly.highCount} alta(s) e ${weekly.attentionCount} em atenção.`
      : 'Neste período, todas as leituras ficaram dentro da faixa alvo registrada.';

  const variabilitySummary = variabilityLabel
    ? weekly.variabilityMgDl !== null && weekly.variabilityMgDl > 28
      ? `As variações ficaram mais amplas, com oscilação em torno de ${variabilityLabel} ${context.unitPreference}.`
      : `As variações ficaram relativamente estáveis, com oscilação em torno de ${variabilityLabel} ${context.unitPreference}.`
    : null;

  return finalizeSafeAssistantResponse(
    `Pelos seus registros, a média recente foi ${averageLabel} ${context.unitPreference} e ${weekly.timeInRange}% ficaram dentro do alvo. ${
      dominantPattern ?? ''
    } ${outOfRangeSummary} ${variabilitySummary ?? ''} Isso não é um diagnóstico, mas já mostra quais momentos merecem observação mais de perto.`.trim(),
    { includeUrgencyNote: weekly.highRiskSignal }
  );
}

export function generateDoctorQuestions(context: AssistantContext) {
  const weekly = getWeeklyAnalytics(context);
  const averageLabel = formatAverageForPreference(weekly.averageMgDl, context.unitPreference);
  const targetLabel = formatTargetRangeLabel(context.targetRange.min, context.targetRange.max, context.unitPreference);

  const questions = [
    `1. Minha faixa alvo atual de ${targetLabel} continua adequada para a minha rotina?`,
    weekly.topContext
      ? `2. O contexto ${weekly.topContext.label} merece alguma atenção especial nos meus registros?`
      : '2. Em quais horários ou contextos vale priorizar meus registros?',
    weekly.count
      ? `3. O que pode ajudar a interpretar uma média de ${averageLabel} ${context.unitPreference} neste período?`
      : '3. Como organizar melhor os registros para tornar a consulta mais útil?',
    weekly.lowCount || weekly.attentionCount
      ? '4. Quais sinais ou sintomas deveriam me fazer procurar atendimento mais cedo?'
      : '4. Quais sinais ou sintomas vale observar junto das medições?',
  ];

  return finalizeSafeAssistantResponse(`Aqui vão algumas perguntas que podem ajudar na consulta:\n\n${questions.join('\n\n')}`, {
    includeUrgencyNote: weekly.highRiskSignal,
  });
}

export function explainProgress(context: AssistantContext) {
  const weekly = getWeeklyAnalytics(context);

  if (!weekly.count) {
    return buildNoDataFallback();
  }

  const previousWeekly = getPreviousWeeklyAnalytics(context);
  const comparison = comparePeriods(weekly, previousWeekly);
  const progressText = buildProgressInsight(weekly.readings, weekly.averageMgDl, weekly.timeInRange, context.unitPreference);
  const trendSummary = previousWeekly.count ? `${describeAverageTrend(comparison, context)} ${describeRangeTrend(comparison)}` : '';

  return finalizeSafeAssistantResponse(`${progressText} ${trendSummary}`.trim(), {
    includeUrgencyNote: weekly.highRiskSignal,
  });
}

export function generateLoggingHabits(context: AssistantContext) {
  const weekly = getWeeklyAnalytics(context);

  if (!weekly.count) {
    return finalizeSafeAssistantResponse(
      'Para criar um hábito de registro, tente escolher um horário previsível por dia, como ao acordar ou antes de dormir. Quando houver algumas medições, eu consigo sugerir ajustes com base na sua rotina.'
    );
  }

  const suggestedAnchor = weekly.topContext?.label ?? 'um horário previsível do seu dia';
  const moodSummary = weekly.topMood ? `O sentimento que mais apareceu foi ${weekly.topMood.toLowerCase()}.` : '';

  return finalizeSafeAssistantResponse(
    `Você já registrou ${weekly.count} medições nesta semana. Para ganhar consistência, vale manter ${suggestedAnchor} como ponto de apoio, registrar uma observação curta quando sair da rotina e repetir o mesmo contexto em dias parecidos para facilitar comparações. ${moodSummary}`.trim()
  );
}

export function answerQuickAction(action: AssistantQuickAction, context: AssistantContext): AssistantAnswer {
  switch (action) {
    case 'Resumo da semana':
      return { content: generateWeeklySummary(context), source: 'quick-action' };
    case 'O que meus números mostram?':
      return { content: generateNumbersMeaning(context), source: 'quick-action' };
    case 'Perguntas para levar ao médico':
      return { content: generateDoctorQuestions(context), source: 'quick-action' };
    case 'Explicar meu progresso':
      return { content: explainProgress(context), source: 'quick-action' };
    case 'Gerar hábitos de registro':
      return { content: generateLoggingHabits(context), source: 'quick-action' };
    default:
      return { content: buildNoDataFallback(), source: 'quick-action' };
  }
}

function answerOpenPrompt(question: string, context: AssistantContext, safetyReview: AssistantSafetyReview): AssistantAnswer {
  if (safetyReview.blocked && safetyReview.response) {
    return {
      content: safetyReview.response,
      source: 'guardrail',
    };
  }

  const normalizedQuestion = question.toLowerCase();

  const summaryKeywords = ['resumo', 'semana', 'últimos 7 dias', 'ultimos 7 dias', 'panorama'];
  const progressKeywords = ['progresso', 'evolu', 'melhorou', 'piorou', 'comparar'];
  const doctorKeywords = ['médico', 'medico', 'consulta', 'pergunta', 'profissional'];
  const habitsKeywords = ['hábito', 'habito', 'rotina', 'registr', 'consist'];
  const rangeKeywords = ['alvo', 'alta', 'baixa', 'atenção', 'atencao', 'fora do alvo', 'números', 'numeros', 'contexto'];

  if (summaryKeywords.some((keyword) => normalizedQuestion.includes(keyword))) {
    return { content: generateWeeklySummary(context), source: 'freeform' };
  }

  if (progressKeywords.some((keyword) => normalizedQuestion.includes(keyword))) {
    return { content: explainProgress(context), source: 'freeform' };
  }

  if (doctorKeywords.some((keyword) => normalizedQuestion.includes(keyword))) {
    return { content: generateDoctorQuestions(context), source: 'freeform' };
  }

  if (habitsKeywords.some((keyword) => normalizedQuestion.includes(keyword))) {
    return { content: generateLoggingHabits(context), source: 'freeform' };
  }

  if (rangeKeywords.some((keyword) => normalizedQuestion.includes(keyword))) {
    return { content: generateNumbersMeaning(context), source: 'freeform' };
  }

  return { content: generateWeeklySummary(context), source: 'freeform' };
}

export function answerAssistantPrompt(question: string, context: AssistantContext): AssistantAnswer {
  const safetyReview = reviewAssistantPrompt(question);
  return answerOpenPrompt(question, context, safetyReview);
}

export function buildAssistantWelcome(context: AssistantContext) {
  const weeklyReadings = getReadingsSinceDays(sortReadingsByDateDesc(context), 7);
  const readingCount = weeklyReadings.length;

  if (!readingCount) {
    return finalizeSafeAssistantResponse(
      `Oi, ${context.userName}. Eu posso resumir seus registros, explicar tendências e sugerir perguntas para consulta. Assim que você tiver algumas medições, eu consigo trazer respostas mais úteis.`
    );
  }

  const { min, max } = getReadingExtremes(weeklyReadings);
  const minLabel = min ? formatReadingValueForPreference(min.value, min.unit, context.unitPreference) : '--';
  const maxLabel = max ? formatReadingValueForPreference(max.value, max.unit, context.unitPreference) : '--';
  const weekly = analyzePeriod(weeklyReadings, context);

  return finalizeSafeAssistantResponse(
    `Oi, ${context.userName}. Revisei ${readingCount} medições dos últimos 7 dias. Neste período, seus registros variaram de ${minLabel} a ${maxLabel} ${context.unitPreference}, com ${weekly.timeInRange}% dentro do alvo. Posso resumir a semana, explicar tendências e sugerir perguntas para a consulta.`
  );
}
