export const glucoseUnits = ['mg/dL', 'mmol/L'] as const;
export const glucoseContexts = [
  'Agora',
  'Jejum',
  'Antes da refeição',
  'Após refeição',
  'Antes de dormir',
  'Após exercício',
  'Mal-estar',
  'Outro',
] as const;
export const glucoseMoods = ['Bem', 'Normal', 'Tonto', 'Cansado', 'Com fome', 'Com sede', 'Sonolento'] as const;
export const glucoseStatuses = ['Baixa', 'Dentro do alvo', 'Alta', 'Atenção'] as const;

export type GlucoseUnit = (typeof glucoseUnits)[number];
export type GlucoseContext = (typeof glucoseContexts)[number];
export type GlucoseMood = (typeof glucoseMoods)[number];
export type GlucoseStatus = (typeof glucoseStatuses)[number];

export type GlucoseReading = {
  id: string;
  remoteId?: string;
  value: number;
  unit: GlucoseUnit;
  measuredAt: string;
  context: GlucoseContext;
  mood: GlucoseMood;
  note: string;
  status: GlucoseStatus;
  createdAt: string;
  updatedAt?: string;
  pendingSync?: boolean;
  syncError?: string | null;
  syncedAt?: string | null;
};

export type AddGlucoseReadingInput = {
  value: number;
  unit: GlucoseUnit;
  measuredAt?: string;
  context: GlucoseContext;
  mood: GlucoseMood;
  note?: string;
};

export type UpdateGlucoseReadingInput = Partial<Omit<GlucoseReading, 'id' | 'createdAt'>> & {
  id: string;
};
