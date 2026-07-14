import { Platform } from 'react-native';

import { PREMIUM_ENTITLEMENT_ID, type SubscriptionResult } from './subscription-types';

type PurchasesModule = {
  configure?: (options: { apiKey: string; appUserID?: string | null }) => void;
  getCustomerInfo?: () => Promise<{
    originalAppUserId?: string;
    entitlements?: {
      active?: Record<string, unknown>;
    };
  }>;
  restorePurchases?: () => Promise<{
    originalAppUserId?: string;
    entitlements?: {
      active?: Record<string, unknown>;
    };
  }>;
};

let isConfigured = false;

function getOptionalPurchasesModule(): PurchasesModule | null {
  try {
    const runtimeRequire = new Function('return require;')() as (specifier: string) => PurchasesModule;
    return runtimeRequire('react-native-purchases');
  } catch {
    return null;
  }
}

function getRevenueCatKey() {
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY?.trim() ?? '';
  }

  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY?.trim() ?? '';
  }

  return '';
}

function mapCustomerInfo(customerInfo?: {
  originalAppUserId?: string;
  entitlements?: {
    active?: Record<string, unknown>;
  };
}) {
  const activeEntitlements = customerInfo?.entitlements?.active ?? {};
  const isPremium = Boolean(activeEntitlements[PREMIUM_ENTITLEMENT_ID]);

  return {
    isPremium,
    plan: isPremium ? ('premium' as const) : ('free' as const),
    provider: 'revenuecat' as const,
    customerId: customerInfo?.originalAppUserId ?? null,
    entitlementId: isPremium ? PREMIUM_ENTITLEMENT_ID : null,
    lastCheckedAt: new Date().toISOString(),
    error: null,
  };
}

export function getRevenueCatStatus() {
  const apiKey = getRevenueCatKey();
  const purchasesModule = getOptionalPurchasesModule();

  if (!purchasesModule) {
    return {
      available: false,
      configured: false,
      message: 'Premium estará disponível em breve. Você continua no plano gratuito.',
    };
  }

  if (!apiKey) {
    return {
      available: true,
      configured: false,
      message: 'Premium estará disponível em breve. Você continua no plano gratuito.',
    };
  }

  return {
    available: true,
    configured: true,
    message: null,
  };
}

export async function configureRevenueCat(appUserId?: string | null): Promise<SubscriptionResult> {
  const apiKey = getRevenueCatKey();
  const purchasesModule = getOptionalPurchasesModule();

  if (!purchasesModule?.configure || !apiKey) {
    return {
      success: true,
      message: getRevenueCatStatus().message ?? 'Premium estará disponível em breve.',
      snapshot: {
        isPremium: false,
        plan: 'free',
        provider: 'mock',
        lastCheckedAt: new Date().toISOString(),
      },
    };
  }

  if (!isConfigured) {
    purchasesModule.configure({
      apiKey,
      appUserID: appUserId ?? null,
    });
    isConfigured = true;
  }

  return {
    success: true,
    message: 'Premium configurado para esta plataforma.',
    snapshot: {
      provider: 'revenuecat',
      lastCheckedAt: new Date().toISOString(),
    },
  };
}

export async function refreshRevenueCatSubscription(): Promise<SubscriptionResult> {
  const purchasesModule = getOptionalPurchasesModule();
  const status = getRevenueCatStatus();

  if (!status.configured || !purchasesModule?.getCustomerInfo) {
    return {
      success: true,
      message: status.message ?? 'Premium estará disponível em breve.',
      snapshot: {
        isPremium: false,
        plan: 'free',
        provider: 'mock',
        lastCheckedAt: new Date().toISOString(),
      },
    };
  }

  try {
    const customerInfo = await purchasesModule.getCustomerInfo();

    return {
      success: true,
      message: 'Status de assinatura atualizado.',
      snapshot: mapCustomerInfo(customerInfo),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Não foi possível atualizar a assinatura agora.',
    };
  }
}

export async function restoreRevenueCatPurchase(): Promise<SubscriptionResult> {
  const purchasesModule = getOptionalPurchasesModule();
  const status = getRevenueCatStatus();

  if (!status.configured || !purchasesModule?.restorePurchases) {
    return {
      success: true,
      message: status.message ?? 'Nenhuma compra Premium ativa foi encontrada.',
      snapshot: {
        isPremium: false,
        plan: 'free',
        provider: 'mock',
        lastCheckedAt: new Date().toISOString(),
      },
    };
  }

  try {
    const customerInfo = await purchasesModule.restorePurchases();

    return {
      success: true,
      message: 'Compras restauradas.',
      snapshot: mapCustomerInfo(customerInfo),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Não foi possível restaurar compras agora.',
    };
  }
}

export async function purchasePremium(): Promise<SubscriptionResult> {
  return {
    success: false,
    message:
      'Premium estará disponível em breve. Você pode continuar no plano gratuito.',
  };
}
