import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createFeatureGates } from '../services/subscriptions/feature-gates';
import {
  configureRevenueCat,
  getRevenueCatStatus,
  purchasePremium,
  refreshRevenueCatSubscription,
  restoreRevenueCatPurchase,
} from '../services/subscriptions/revenueCatService';
import type {
  FeatureGates,
  SubscriptionPlan,
  SubscriptionProvider,
  SubscriptionResult,
} from '../services/subscriptions/subscription-types';

const STORAGE_KEY = 'glicoai-subscription';

type SubscriptionStore = {
  isPremium: boolean;
  plan: SubscriptionPlan;
  provider: SubscriptionProvider;
  customerId: string | null;
  entitlementId: string | null;
  lastCheckedAt: string | null;
  error: string | null;
  hasHydrated: boolean;
  gates: FeatureGates;
  configure: (appUserId?: string | null) => Promise<SubscriptionResult>;
  refresh: () => Promise<SubscriptionResult>;
  purchasePremium: () => Promise<SubscriptionResult>;
  restorePurchase: () => Promise<SubscriptionResult>;
  setMockPremiumForDevelopment: (isPremium: boolean) => void;
  setHydrated: (hasHydrated: boolean) => void;
  resetForDevelopment: () => Promise<void>;
};

function buildStateFromResult(result: SubscriptionResult) {
  const isPremium = result.snapshot?.isPremium ?? false;

  return {
    isPremium,
    plan: result.snapshot?.plan ?? (isPremium ? ('premium' as const) : ('free' as const)),
    provider: result.snapshot?.provider ?? ('mock' as const),
    customerId: result.snapshot?.customerId ?? null,
    entitlementId: result.snapshot?.entitlementId ?? null,
    lastCheckedAt: result.snapshot?.lastCheckedAt ?? new Date().toISOString(),
    error: result.success ? null : result.message,
    gates: createFeatureGates(isPremium),
  };
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set) => ({
      isPremium: false,
      plan: 'free',
      provider: 'mock',
      customerId: null,
      entitlementId: null,
      lastCheckedAt: null,
      error: null,
      hasHydrated: false,
      gates: createFeatureGates(false),

      configure: async (appUserId) => {
        const result = await configureRevenueCat(appUserId);
        set(buildStateFromResult(result));
        return result;
      },

      refresh: async () => {
        const result = await refreshRevenueCatSubscription();
        set(buildStateFromResult(result));
        return result;
      },

      purchasePremium: async () => {
        const result = await purchasePremium();
        set((state) => ({
          error: result.success ? null : result.message,
          lastCheckedAt: new Date().toISOString(),
          provider: getRevenueCatStatus().configured ? 'revenuecat' : state.provider,
        }));
        return result;
      },

      restorePurchase: async () => {
        const result = await restoreRevenueCatPurchase();
        set(buildStateFromResult(result));
        return result;
      },

      setMockPremiumForDevelopment: (isPremium) =>
        set({
          isPremium,
          plan: isPremium ? 'premium' : 'free',
          provider: 'mock',
          gates: createFeatureGates(isPremium),
          lastCheckedAt: new Date().toISOString(),
          error: null,
        }),

      setHydrated: (hasHydrated) => set({ hasHydrated }),

      resetForDevelopment: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
        set({
          isPremium: false,
          plan: 'free',
          provider: 'mock',
          customerId: null,
          entitlementId: null,
          lastCheckedAt: null,
          error: null,
          hasHydrated: true,
          gates: createFeatureGates(false),
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isPremium: state.isPremium,
        plan: state.plan,
        provider: state.provider,
        customerId: state.customerId,
        entitlementId: state.entitlementId,
        lastCheckedAt: state.lastCheckedAt,
        error: state.error,
      }),
      merge: (persistedState, currentState) => {
        const typedState = persistedState as Partial<SubscriptionStore> | undefined;
        const isPremium = typedState?.isPremium ?? currentState.isPremium;

        return {
          ...currentState,
          ...typedState,
          gates: createFeatureGates(isPremium),
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
