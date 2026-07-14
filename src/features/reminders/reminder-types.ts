import type { ReminderPermissionStatus } from '../profile/profile-types';

export const reminderContexts = [
  'Jejum',
  'Antes da refeição',
  'Após refeição',
  'Antes de dormir',
  'Personalizado',
] as const;

export const reminderMessageSuggestions = [
  'Hora de registrar sua glicose \uD83D\uDCA7',
  'Vamos cuidar da sua saúde com leveza?',
  'Seu check-in de glicose está esperando.',
] as const;

export const reminderWeekdayOptions = [
  { key: 'mon', label: 'Seg', order: 1, notificationWeekday: 2 },
  { key: 'tue', label: 'Ter', order: 2, notificationWeekday: 3 },
  { key: 'wed', label: 'Qua', order: 3, notificationWeekday: 4 },
  { key: 'thu', label: 'Qui', order: 4, notificationWeekday: 5 },
  { key: 'fri', label: 'Sex', order: 5, notificationWeekday: 6 },
  { key: 'sat', label: 'Sab', order: 6, notificationWeekday: 7 },
  { key: 'sun', label: 'Dom', order: 7, notificationWeekday: 1 },
] as const;

export type ReminderContext = (typeof reminderContexts)[number];
export type ReminderWeekday = (typeof reminderWeekdayOptions)[number]['key'];

export type GlucoseReminder = {
  id: string;
  remoteId?: string;
  time: string;
  days: ReminderWeekday[];
  context: ReminderContext;
  message: string;
  enabled: boolean;
  notificationIds: string[];
  createdAt: string;
  updatedAt: string;
  pendingSync?: boolean;
  syncError?: string | null;
  syncedAt?: string | null;
};

export type ReminderDraft = {
  time: string;
  days: ReminderWeekday[];
  context: ReminderContext;
  message: string;
  enabled: boolean;
};

export type ReminderNotificationSupport = {
  available: boolean;
  permissionStatus: ReminderPermissionStatus;
  message: string | null;
};
