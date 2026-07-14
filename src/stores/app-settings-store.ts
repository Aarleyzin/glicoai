import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  HealthProfile,
  PersistedAppSettings,
  ReminderPreferences,
  TargetRange,
} from '../features/profile/profile-types';
import { upsertProfile } from '../services/profile/profileService';
import { removeSensitiveItem, sensitiveStateStorage } from '../services/storage/sensitive-storage';

const STORAGE_KEY = 'glicoai-app-settings';

const defaultHealthProfile: HealthProfile = {
  name: '',
  birthDate: '',
  trackingType: 'Acompanhamento preventivo',
  usesInsulin: 'Prefiro não informar',
  usesMedication: 'Prefiro não informar',
};

const defaultTargetRange: TargetRange = {
  min: 70,
  max: 180,
  isCustom: false,
};

const defaultReminderPreferences: ReminderPreferences = {
  notificationsEnabled: false,
  permissionStatus: 'unknown',
};

function createDefaultPersistedState(): PersistedAppSettings {
  return {
    hasSeenOnboarding: false,
    isAuthenticated: false,
    hasCompletedHealthProfile: false,
    healthProfile: defaultHealthProfile,
    unitPreference: 'mg/dL',
    targetRange: defaultTargetRange,
    reminderPreferences: defaultReminderPreferences,
  };
}

type AppSettingsStore = PersistedAppSettings & {
  hasHydrated: boolean;
  hydrationError: string | null;
  completeOnboarding: () => void;
  signIn: () => void;
  signOut: () => void;
  completeHealthProfile: () => void;
  updateHealthProfile: (profile: Partial<HealthProfile>) => void;
  setUnitPreference: (unitPreference: PersistedAppSettings['unitPreference']) => void;
  setTargetRange: (targetRange: TargetRange) => void;
  setReminderPreferences: (preferences: Partial<ReminderPreferences>) => void;
  syncProfile: () => Promise<void>;
  syncPendingProfile: () => Promise<void>;
  setHydrated: (hasHydrated: boolean) => void;
  setHydrationError: (error: string | null) => void;
  resetForDevelopment: () => Promise<void>;
};

export const useAppSettingsStore = create<AppSettingsStore>()(
  persist(
    (set, get) => ({
      ...createDefaultPersistedState(),
      hasHydrated: true,
      hydrationError: null,

      completeOnboarding: () => set({ hasSeenOnboarding: true }),
      signIn: () => set({ isAuthenticated: true }),
      signOut: () => set({ isAuthenticated: false }),
      completeHealthProfile: () => set({ hasCompletedHealthProfile: true }),
      updateHealthProfile: (profile) => {
        set((state) => ({
          healthProfile: {
            ...state.healthProfile,
            ...profile,
            pendingSync: true,
            syncError: null,
          },
        }));
        void get().syncProfile();
      },
      setUnitPreference: (unitPreference) => {
        set((state) => ({
          unitPreference,
          healthProfile: {
            ...state.healthProfile,
            pendingSync: true,
            syncError: null,
          },
        }));
        void get().syncProfile();
      },
      setTargetRange: (targetRange) => {
        set((state) => ({
          targetRange,
          healthProfile: {
            ...state.healthProfile,
            pendingSync: true,
            syncError: null,
          },
        }));
        void get().syncProfile();
      },
      setReminderPreferences: (preferences) =>
        set((state) => ({
          reminderPreferences: {
            ...state.reminderPreferences,
            ...preferences,
          },
        })),
      setHydrated: (hasHydrated) => set({ hasHydrated }),
      setHydrationError: (hydrationError) => set({ hydrationError }),
      syncProfile: async () => {
        const state = get();
        const syncResult = await upsertProfile({
          healthProfile: state.healthProfile,
          unitPreference: state.unitPreference,
          targetRange: state.targetRange,
        });

        set((currentState) => ({
          healthProfile: {
            ...currentState.healthProfile,
            remoteId: syncResult.data?.remoteId ?? currentState.healthProfile.remoteId,
            pendingSync: syncResult.pendingSync,
            syncError: syncResult.error,
            syncedAt: syncResult.data?.syncedAt ?? currentState.healthProfile.syncedAt ?? null,
          },
        }));
      },
      syncPendingProfile: async () => {
        if (get().healthProfile.pendingSync) {
          await get().syncProfile();
        }
      },
      resetForDevelopment: async () => {
        await removeSensitiveItem(STORAGE_KEY);
        set({
          ...createDefaultPersistedState(),
          hasHydrated: true,
          hydrationError: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sensitiveStateStorage),
      merge: (persistedState, currentState) => {
        const typedState = persistedState as Partial<PersistedAppSettings> | undefined;

        return {
          ...currentState,
          ...typedState,
          healthProfile: {
            ...currentState.healthProfile,
            ...typedState?.healthProfile,
          },
          targetRange: {
            ...currentState.targetRange,
            ...typedState?.targetRange,
          },
          reminderPreferences: {
            ...currentState.reminderPreferences,
            ...typedState?.reminderPreferences,
          },
        };
      },
      partialize: (state) => ({
        hasSeenOnboarding: state.hasSeenOnboarding,
        isAuthenticated: state.isAuthenticated,
        hasCompletedHealthProfile: state.hasCompletedHealthProfile,
        healthProfile: state.healthProfile,
        unitPreference: state.unitPreference,
        targetRange: state.targetRange,
        reminderPreferences: state.reminderPreferences,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!state) {
          return;
        }

        if (error) {
          state.setHydrationError('Não foi possível restaurar suas configurações locais.');
        } else {
          state.setHydrationError(null);
        }

        state.setHydrated(true);
      },
    }
  )
);
