export type SubscriptionPlan = 'free' | 'premium';

export type SubscriptionProvider = 'mock' | 'revenuecat';

export type FeatureGates = {
  canUseAI: boolean;
  canGenerateReports: boolean;
  canViewFullHistory: boolean;
  canCreateUnlimitedReminders: boolean;
};

export type SubscriptionStateSnapshot = {
  isPremium: boolean;
  plan: SubscriptionPlan;
  provider: SubscriptionProvider;
  customerId: string | null;
  entitlementId: string | null;
  lastCheckedAt: string | null;
  error: string | null;
};

export type SubscriptionResult = {
  success: boolean;
  message: string;
  snapshot?: Partial<SubscriptionStateSnapshot>;
};

export const freePlanBenefits = [
  'Registrar medições',
  'Dashboard básico',
  'Histórico dos últimos 7 dias',
  'Lembretes limitados',
  'Insights locais básicos',
] as const;

export const premiumPlanBenefits = [
  'Histórico ilimitado',
  'Relatórios PDF',
  'Assistente IA avançado',
  'Insights semanais',
  'Exportação para médico',
  'Lembretes ilimitados',
  'Backup em nuvem',
] as const;

export const FREE_REMINDER_LIMIT = 3;
export const PREMIUM_ENTITLEMENT_ID = 'premium';
