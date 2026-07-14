import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  createReportRecord,
  deleteReport as deleteRemoteReport,
} from '../services/reports/reportService';
import { removeSensitiveItem, sensitiveStateStorage } from '../services/storage/sensitive-storage';

const STORAGE_KEY = 'glicoai-reports';

export type LocalReportRecord = {
  id: string;
  remoteId?: string;
  period: string;
  fileUrl?: string | null;
  createdAt: string;
  pendingSync?: boolean;
  syncError?: string | null;
  syncedAt?: string | null;
};

type ReportsStore = {
  reports: LocalReportRecord[];
  hasHydrated: boolean;
  hydrationError: string | null;
  addReport: (input: { period: string; fileUrl?: string | null }) => LocalReportRecord;
  deleteReport: (id: string) => Promise<void>;
  syncReport: (report: LocalReportRecord) => Promise<void>;
  syncPendingReports: () => Promise<void>;
  setHydrated: (hasHydrated: boolean) => void;
  setHydrationError: (error: string | null) => void;
  resetForDevelopment: () => Promise<void>;
};

function createReportId() {
  return `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useReportsStore = create<ReportsStore>()(
  persist(
    (set, get) => ({
      reports: [],
      hasHydrated: false,
      hydrationError: null,

      addReport: (input) => {
        const report: LocalReportRecord = {
          id: createReportId(),
          period: input.period,
          fileUrl: input.fileUrl ?? null,
          createdAt: new Date().toISOString(),
          pendingSync: true,
          syncError: null,
          syncedAt: null,
        };

        set((state) => ({
          reports: [report, ...state.reports],
        }));

        void get().syncReport(report);

        return report;
      },

      deleteReport: async (id) => {
        const report = get().reports.find((currentReport) => currentReport.id === id);
        set((state) => ({
          reports: state.reports.filter((currentReport) => currentReport.id !== id),
        }));

        await deleteRemoteReport(report?.remoteId);
      },

      syncReport: async (report) => {
        const syncResult = await createReportRecord({
          remoteId: report.remoteId,
          period: report.period,
          fileUrl: report.fileUrl,
        });

        set((state) => ({
          reports: state.reports.map((currentReport) =>
            currentReport.id === report.id
              ? {
                  ...currentReport,
                  remoteId: syncResult.data?.remoteId ?? currentReport.remoteId,
                  pendingSync: syncResult.pendingSync,
                  syncError: syncResult.error,
                  syncedAt: syncResult.data?.syncedAt ?? currentReport.syncedAt ?? null,
                }
              : currentReport
          ),
        }));
      },

      syncPendingReports: async () => {
        const pendingReports = get().reports.filter((report) => report.pendingSync);

        for (const report of pendingReports) {
          await get().syncReport(report);
        }
      },

      setHydrated: (hasHydrated) => set({ hasHydrated }),
      setHydrationError: (hydrationError) => set({ hydrationError }),
      resetForDevelopment: async () => {
        await removeSensitiveItem(STORAGE_KEY);
        set({
          reports: [],
          hasHydrated: true,
          hydrationError: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sensitiveStateStorage),
      partialize: (state) => ({
        reports: state.reports,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!state) {
          return;
        }

        if (error) {
          state.setHydrationError('Não foi possível restaurar os relatórios locais.');
        } else {
          state.setHydrationError(null);
        }

        state.setHydrated(true);
      },
    }
  )
);
