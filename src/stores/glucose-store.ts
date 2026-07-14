import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  AddGlucoseReadingInput,
  GlucoseReading,
  UpdateGlucoseReadingInput,
} from '../features/glucose/glucose-types';
import type { TargetRange } from '../features/profile/profile-types';
import {
  convertToMgDl,
  createReadingFromInput,
  getGlucoseStatus,
  getReadingsSinceDays,
} from '../features/glucose/glucose-utils';
import {
  deleteGlucoseReading,
  upsertGlucoseReading,
} from '../services/glucose/glucoseReadingService';
import { removeSensitiveItem, sensitiveStateStorage } from '../services/storage/sensitive-storage';
import { useAppSettingsStore } from './app-settings-store';

type ReadingPeriod = 'today' | 7 | 30 | 90;

type GlucoseStore = {
  readings: GlucoseReading[];
  hasHydrated: boolean;
  hydrationError: string | null;
  addReading: (input: AddGlucoseReadingInput) => GlucoseReading;
  updateReading: (input: UpdateGlucoseReadingInput) => GlucoseReading | undefined;
  deleteReading: (id: string) => void;
  syncReading: (reading: GlucoseReading) => Promise<void>;
  syncPendingReadings: () => Promise<void>;
  getLatestReading: () => GlucoseReading | undefined;
  getTodayAverage: () => number | null;
  getTimeInRange: (period?: Exclude<ReadingPeriod, 'today'>) => number;
  getReadingsByPeriod: (period: ReadingPeriod) => GlucoseReading[];
  recalculateStatuses: (targetRange: Pick<TargetRange, 'min' | 'max'>) => void;
  setHydrated: (hasHydrated: boolean) => void;
  setHydrationError: (error: string | null) => void;
  resetForDevelopment: () => Promise<void>;
};

const STORAGE_KEY = 'glicoai-glucose-readings';

function sortByMeasuredAtDescending(readings: GlucoseReading[]) {
  return [...readings].sort((left, right) => new Date(right.measuredAt).getTime() - new Date(left.measuredAt).getTime());
}

function calculateAverage(readings: GlucoseReading[]) {
  if (readings.length === 0) {
    return null;
  }

  const total = readings.reduce((sum, reading) => sum + convertToMgDl(reading.value, reading.unit), 0);
  return Math.round(total / readings.length);
}

export const useGlucoseStore = create<GlucoseStore>()(
  persist(
    (set, get) => ({
      readings: [],
      hasHydrated: false,
      hydrationError: null,

      addReading: (input) => {
        const targetRange = useAppSettingsStore.getState().targetRange;
        const nextReading = {
          ...createReadingFromInput(input, targetRange),
          updatedAt: new Date().toISOString(),
          pendingSync: true,
          syncError: null,
          syncedAt: null,
        };

        set((state) => ({
          readings: sortByMeasuredAtDescending([nextReading, ...state.readings]),
        }));

        void get().syncReading(nextReading);

        return nextReading;
      },

      updateReading: (input) => {
        const currentReading = get().readings.find((reading) => reading.id === input.id);

        if (!currentReading) {
          return undefined;
        }

        const nextReadingBase: GlucoseReading = {
          ...currentReading,
          ...input,
        };
        const nextReading: GlucoseReading = {
          ...nextReadingBase,
          status: getGlucoseStatus(
            nextReadingBase.value,
            nextReadingBase.unit,
            useAppSettingsStore.getState().targetRange
          ),
          updatedAt: new Date().toISOString(),
          pendingSync: true,
          syncError: null,
        };

        set((state) => ({
          readings: sortByMeasuredAtDescending(
            state.readings.map((reading) => (reading.id === input.id ? nextReading : reading))
          ),
        }));

        void get().syncReading(nextReading);

        return nextReading;
      },

      deleteReading: (id) => {
        const reading = get().readings.find((currentReading) => currentReading.id === id);
        set((state) => ({
          readings: state.readings.filter((reading) => reading.id !== id),
        }));

        void deleteGlucoseReading(reading?.remoteId);
      },

      syncReading: async (reading) => {
        const syncResult = await upsertGlucoseReading(reading);

        set((state) => ({
          readings: state.readings.map((currentReading) =>
            currentReading.id === reading.id
              ? {
                  ...currentReading,
                  remoteId: syncResult.data?.remoteId ?? currentReading.remoteId,
                  pendingSync: syncResult.pendingSync,
                  syncError: syncResult.error,
                  syncedAt: syncResult.data?.syncedAt ?? currentReading.syncedAt ?? null,
                }
              : currentReading
          ),
        }));
      },

      syncPendingReadings: async () => {
        const pendingReadings = get().readings.filter((reading) => reading.pendingSync);

        for (const reading of pendingReadings) {
          await get().syncReading(reading);
        }
      },

      getLatestReading: () => get().readings[0],

      getTodayAverage: () => {
        const todayReadings = get().getReadingsByPeriod('today');
        return calculateAverage(todayReadings);
      },

      getTimeInRange: (period = 7) => {
        const readings = get().getReadingsByPeriod(period);

        if (readings.length === 0) {
          return 0;
        }

        const targetRange = useAppSettingsStore.getState().targetRange;
        const inRangeCount = readings.filter((reading) => {
          const normalizedValue = convertToMgDl(reading.value, reading.unit);
          return normalizedValue >= targetRange.min && normalizedValue <= targetRange.max;
        }).length;

        return Math.round((inRangeCount / readings.length) * 100);
      },

      getReadingsByPeriod: (period) => {
        const readings = sortByMeasuredAtDescending(get().readings);

        if (period === 'today') {
          return readings.filter((reading) => {
            const date = new Date(reading.measuredAt);
            const now = new Date();
            return (
              date.getFullYear() === now.getFullYear() &&
              date.getMonth() === now.getMonth() &&
              date.getDate() === now.getDate()
            );
          });
        }

        return getReadingsSinceDays(readings, period);
      },

      recalculateStatuses: (targetRange) => {
        set((state) => ({
          readings: sortByMeasuredAtDescending(
            state.readings.map((reading) => ({
              ...reading,
              status: getGlucoseStatus(reading.value, reading.unit, targetRange),
              updatedAt: new Date().toISOString(),
              pendingSync: true,
              syncError: null,
            }))
          ),
        }));

        void get().syncPendingReadings();
      },

      setHydrated: (hasHydrated) => set({ hasHydrated }),
      setHydrationError: (hydrationError) => set({ hydrationError }),
      resetForDevelopment: async () => {
        await removeSensitiveItem(STORAGE_KEY);
        set({
          readings: [],
          hasHydrated: true,
          hydrationError: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sensitiveStateStorage),
      partialize: (state) => ({
        readings: state.readings,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!state) {
          return;
        }

        if (error) {
          state.setHydrationError('Não foi possível restaurar suas medições locais.');
        } else {
          state.setHydrationError(null);
        }

        state.setHydrated(true);
      },
    }
  )
);

export function getReadingExtremes(readings: GlucoseReading[]) {
  if (readings.length === 0) {
    return {
      min: null,
      max: null,
    };
  }

  const normalized = readings.map((reading) => ({
    ...reading,
    normalizedValue: convertToMgDl(reading.value, reading.unit),
  }));

  const min = normalized.reduce((lowest, reading) => (reading.normalizedValue < lowest.normalizedValue ? reading : lowest));
  const max = normalized.reduce((highest, reading) =>
    reading.normalizedValue > highest.normalizedValue ? reading : highest
  );

  return { min, max };
}
