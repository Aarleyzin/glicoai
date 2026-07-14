import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { GlucoseReminder, ReminderDraft, ReminderNotificationSupport } from '../features/reminders/reminder-types';
import { createReminderFromDraft, createReminderId, validateReminderDraft } from '../features/reminders/reminder-utils';
import {
  cancelReminderNotifications,
  getLocalNotificationSupport,
  requestLocalNotificationPermission,
  rescheduleReminderNotifications,
  scheduleReminderNotifications,
} from '../services/reminders/notifications-service';
import {
  deleteReminder as deleteRemoteReminder,
  upsertReminder,
} from '../services/reminders/reminderService';
import { removeSensitiveItem, sensitiveStateStorage } from '../services/storage/sensitive-storage';
import { useAppSettingsStore } from './app-settings-store';

const STORAGE_KEY = 'glicoai-reminders';

type ReminderMutationResult = {
  reminder: GlucoseReminder;
  warning: string | null;
};

type RemindersStore = {
  reminders: GlucoseReminder[];
  hasHydrated: boolean;
  hydrationError: string | null;
  notificationSupport: ReminderNotificationSupport;
  setHydrated: (hasHydrated: boolean) => void;
  setHydrationError: (error: string | null) => void;
  refreshNotificationSupport: () => Promise<ReminderNotificationSupport>;
  requestNotificationPermission: () => Promise<ReminderNotificationSupport>;
  addReminder: (draft: ReminderDraft) => Promise<ReminderMutationResult>;
  updateReminder: (reminderId: string, draft: ReminderDraft) => Promise<ReminderMutationResult | null>;
  toggleReminder: (reminderId: string, enabled: boolean) => Promise<ReminderMutationResult | null>;
  deleteReminder: (reminderId: string) => Promise<void>;
  syncReminder: (reminder: GlucoseReminder) => Promise<void>;
  syncPendingReminders: () => Promise<void>;
  resetForDevelopment: () => Promise<void>;
};

const defaultNotificationSupport: ReminderNotificationSupport = {
  available: false,
  permissionStatus: 'unknown',
  message: null,
};

function syncReminderPreferenceFromSupport(notificationSupport: ReminderNotificationSupport) {
  useAppSettingsStore.getState().setReminderPreferences({
    notificationsEnabled: notificationSupport.permissionStatus === 'granted',
    permissionStatus: notificationSupport.permissionStatus,
  });
}

export const useRemindersStore = create<RemindersStore>()(
  persist(
    (set, get) => ({
      reminders: [],
      hasHydrated: false,
      hydrationError: null,
      notificationSupport: defaultNotificationSupport,

      setHydrated: (hasHydrated) => set({ hasHydrated }),
      setHydrationError: (hydrationError) => set({ hydrationError }),

      refreshNotificationSupport: async () => {
        const notificationSupport = await getLocalNotificationSupport();

        syncReminderPreferenceFromSupport(notificationSupport);
        set({ notificationSupport });

        return notificationSupport;
      },

      requestNotificationPermission: async () => {
        const notificationSupport = await requestLocalNotificationPermission();

        syncReminderPreferenceFromSupport(notificationSupport);

        if (notificationSupport.permissionStatus === 'granted') {
          const updatedReminders: GlucoseReminder[] = [];

          for (const reminder of get().reminders) {
            if (!reminder.enabled) {
              updatedReminders.push(reminder);
              continue;
            }

            const scheduleResult = await rescheduleReminderNotifications(reminder, reminder.notificationIds);

            updatedReminders.push({
              ...reminder,
              notificationIds: scheduleResult.notificationIds,
              updatedAt: new Date().toISOString(),
            });
          }

          set({
            reminders: updatedReminders,
            notificationSupport,
          });
        } else {
          set({ notificationSupport });
        }

        return notificationSupport;
      },

      addReminder: async (draft) => {
        const validationError = validateReminderDraft(draft);

        if (validationError) {
          throw new Error(validationError);
        }

        const now = new Date().toISOString();
        const reminder: GlucoseReminder = {
          id: createReminderId(),
          ...createReminderFromDraft(draft),
          createdAt: now,
          updatedAt: now,
          notificationIds: [],
        };

        const scheduleResult = reminder.enabled
          ? await scheduleReminderNotifications(reminder)
          : { notificationIds: [], permissionStatus: get().notificationSupport.permissionStatus, warning: null };

        const nextReminder = {
          ...reminder,
          notificationIds: scheduleResult.notificationIds,
          pendingSync: true,
          syncError: null,
          syncedAt: null,
        };

        set((state) => ({
          reminders: [nextReminder, ...state.reminders],
          notificationSupport: {
            ...state.notificationSupport,
            permissionStatus: scheduleResult.permissionStatus,
          },
        }));

        useAppSettingsStore.getState().setReminderPreferences({
          notificationsEnabled: scheduleResult.permissionStatus === 'granted',
          permissionStatus: scheduleResult.permissionStatus,
        });

        void get().syncReminder(nextReminder);

        return {
          reminder: nextReminder,
          warning: scheduleResult.warning,
        };
      },

      updateReminder: async (reminderId, draft) => {
        const validationError = validateReminderDraft(draft);

        if (validationError) {
          throw new Error(validationError);
        }

        const currentReminder = get().reminders.find((reminder) => reminder.id === reminderId);

        if (!currentReminder) {
          return null;
        }

        const updatedReminder: GlucoseReminder = {
          ...currentReminder,
          ...createReminderFromDraft(draft),
          updatedAt: new Date().toISOString(),
        };

        const scheduleResult = await rescheduleReminderNotifications(updatedReminder, currentReminder.notificationIds);
        const nextReminder = {
          ...updatedReminder,
          notificationIds: scheduleResult.notificationIds,
          pendingSync: true,
          syncError: null,
        };

        set((state) => ({
          reminders: state.reminders.map((reminder) => (reminder.id === reminderId ? nextReminder : reminder)),
          notificationSupport: {
            ...state.notificationSupport,
            permissionStatus: scheduleResult.permissionStatus,
          },
        }));

        useAppSettingsStore.getState().setReminderPreferences({
          notificationsEnabled: scheduleResult.permissionStatus === 'granted',
          permissionStatus: scheduleResult.permissionStatus,
        });

        void get().syncReminder(nextReminder);

        return {
          reminder: nextReminder,
          warning: scheduleResult.warning,
        };
      },

      toggleReminder: async (reminderId, enabled) => {
        const currentReminder = get().reminders.find((reminder) => reminder.id === reminderId);

        if (!currentReminder) {
          return null;
        }

        const toggledReminder: GlucoseReminder = {
          ...currentReminder,
          enabled,
          updatedAt: new Date().toISOString(),
        };

        const scheduleResult = enabled
          ? await rescheduleReminderNotifications(toggledReminder, currentReminder.notificationIds)
          : await (async () => {
              await cancelReminderNotifications(currentReminder.notificationIds);

              return {
                notificationIds: [] as string[],
                permissionStatus: get().notificationSupport.permissionStatus,
                warning: null,
              };
            })();

        const nextReminder = {
          ...toggledReminder,
          notificationIds: scheduleResult.notificationIds,
          pendingSync: true,
          syncError: null,
        };

        set((state) => ({
          reminders: state.reminders.map((reminder) => (reminder.id === reminderId ? nextReminder : reminder)),
          notificationSupport: {
            ...state.notificationSupport,
            permissionStatus: scheduleResult.permissionStatus,
          },
        }));

        useAppSettingsStore.getState().setReminderPreferences({
          notificationsEnabled:
            scheduleResult.permissionStatus === 'granted' &&
            get().reminders.some((reminder) => (reminder.id === reminderId ? nextReminder.enabled : reminder.enabled)),
          permissionStatus: scheduleResult.permissionStatus,
        });

        void get().syncReminder(nextReminder);

        return {
          reminder: nextReminder,
          warning: scheduleResult.warning,
        };
      },

      deleteReminder: async (reminderId) => {
        const currentReminder = get().reminders.find((reminder) => reminder.id === reminderId);

        if (!currentReminder) {
          return;
        }

        await cancelReminderNotifications(currentReminder.notificationIds);
        await deleteRemoteReminder(currentReminder.remoteId);

        const nextReminders = get().reminders.filter((reminder) => reminder.id !== reminderId);

        set({ reminders: nextReminders });

        useAppSettingsStore.getState().setReminderPreferences({
          notificationsEnabled:
            get().notificationSupport.permissionStatus === 'granted' && nextReminders.some((reminder) => reminder.enabled),
        });
      },

      syncReminder: async (reminder) => {
        const syncResult = await upsertReminder(reminder);

        set((state) => ({
          reminders: state.reminders.map((currentReminder) =>
            currentReminder.id === reminder.id
              ? {
                  ...currentReminder,
                  remoteId: syncResult.data?.remoteId ?? currentReminder.remoteId,
                  pendingSync: syncResult.pendingSync,
                  syncError: syncResult.error,
                  syncedAt: syncResult.data?.syncedAt ?? currentReminder.syncedAt ?? null,
                }
              : currentReminder
          ),
        }));
      },

      syncPendingReminders: async () => {
        const pendingReminders = get().reminders.filter((reminder) => reminder.pendingSync);

        for (const reminder of pendingReminders) {
          await get().syncReminder(reminder);
        }
      },

      resetForDevelopment: async () => {
        const currentReminders = get().reminders;

        await Promise.allSettled(currentReminders.map((reminder) => cancelReminderNotifications(reminder.notificationIds)));
        await removeSensitiveItem(STORAGE_KEY);

        set({
          reminders: [],
          hasHydrated: true,
          hydrationError: null,
          notificationSupport: defaultNotificationSupport,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sensitiveStateStorage),
      partialize: (state) => ({
        reminders: state.reminders,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<RemindersStore>),
        reminders: (persistedState as Partial<RemindersStore> | undefined)?.reminders ?? currentState.reminders,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!state) {
          return;
        }

        if (error) {
          state.setHydrationError('Não foi possível restaurar seus lembretes locais.');
        } else {
          state.setHydrationError(null);
        }

        state.setHydrated(true);
      },
    }
  )
);
