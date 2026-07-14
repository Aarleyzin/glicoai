import type { GlucoseUnit } from '../glucose/glucose-types';

export const trackingTypes = [
  'Diabetes tipo 1',
  'Diabetes tipo 2',
  'Pré-diabetes',
  'Gestacional',
  'Acompanhamento preventivo',
  'Prefiro não informar',
] as const;

export const yesNoUnknownOptions = ['Sim', 'Não', 'Prefiro não informar'] as const;

export type TrackingType = (typeof trackingTypes)[number];
export type YesNoUnknown = (typeof yesNoUnknownOptions)[number];

export type HealthProfile = {
  remoteId?: string;
  name: string;
  birthDate: string;
  trackingType: TrackingType;
  usesInsulin: YesNoUnknown;
  usesMedication: YesNoUnknown;
  pendingSync?: boolean;
  syncError?: string | null;
  syncedAt?: string | null;
};

export type TargetRange = {
  min: number;
  max: number;
  isCustom: boolean;
};

export type ReminderPermissionStatus = 'unknown' | 'granted' | 'denied' | 'unavailable';

export type ReminderPreferences = {
  notificationsEnabled: boolean;
  permissionStatus: ReminderPermissionStatus;
};

export type PersistedAppSettings = {
  hasSeenOnboarding: boolean;
  isAuthenticated: boolean;
  hasCompletedHealthProfile: boolean;
  healthProfile: HealthProfile;
  unitPreference: GlucoseUnit;
  targetRange: TargetRange;
  reminderPreferences: ReminderPreferences;
};
