import type { FeatureGates } from './subscription-types';

export const arePremiumGatesEnabled = process.env.EXPO_PUBLIC_PREMIUM_GATES_ENABLED === 'true';

export function createFeatureGates(isPremium: boolean): FeatureGates {
  if (!arePremiumGatesEnabled) {
    return {
      canUseAI: true,
      canGenerateReports: true,
      canViewFullHistory: true,
      canCreateUnlimitedReminders: true,
    };
  }

  return {
    canUseAI: isPremium,
    canGenerateReports: isPremium,
    canViewFullHistory: isPremium,
    canCreateUnlimitedReminders: isPremium,
  };
}

export function getLockedFeatureMessage(feature: keyof FeatureGates) {
  const messages: Record<keyof FeatureGates, string> = {
    canUseAI: 'O Assistente IA avançado faz parte do Premium. O assistente local básico continua disponível.',
    canGenerateReports: 'Relatórios PDF fazem parte do Premium. Seus dados seguem acessíveis no app.',
    canViewFullHistory: 'Histórico ilimitado faz parte do Premium. Seus dados locais não são apagados nem bloqueados.',
    canCreateUnlimitedReminders: 'Lembretes ilimitados fazem parte do Premium. Você pode manter e editar os lembretes existentes.',
  };

  return messages[feature];
}
