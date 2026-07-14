import type { GlucoseReading, GlucoseUnit } from '../../features/glucose/glucose-types';
import type { TargetRange } from '../../features/profile/profile-types';

export const assistantQuickActions = [
  'Resumo da semana',
  'O que meus números mostram?',
  'Perguntas para levar ao médico',
  'Explicar meu progresso',
  'Gerar hábitos de registro',
] as const;

export type AssistantQuickAction = (typeof assistantQuickActions)[number];

export type AssistantMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  source: 'quick-action' | 'freeform' | 'guardrail' | 'system';
  createdAt: string;
};

export type AssistantContext = {
  userName: string;
  unitPreference: GlucoseUnit;
  targetRange: TargetRange;
  readings: GlucoseReading[];
};

export type AssistantSafetyReview = {
  blocked: boolean;
  riskLevel: 'low' | 'moderate' | 'high';
  reason: 'diagnosis' | 'medication' | 'insulin' | 'treatment' | 'cure' | 'urgency' | 'safe';
  response: string | null;
};

export type AssistantAnswer = {
  content: string;
  source: AssistantMessage['source'];
};
