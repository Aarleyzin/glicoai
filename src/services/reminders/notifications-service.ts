import { Platform } from 'react-native';

import type { GlucoseReminder, ReminderNotificationSupport } from '../../features/reminders/reminder-types';
import { parseReminderTime, sortReminderDays } from '../../features/reminders/reminder-utils';
import { reminderWeekdayOptions } from '../../features/reminders/reminder-types';

type ExpoNotificationsModule = {
  setNotificationHandler?: (handler: {
    handleNotification: () => Promise<{
      shouldShowBanner?: boolean;
      shouldShowList?: boolean;
      shouldPlaySound?: boolean;
      shouldSetBadge?: boolean;
      shouldShowAlert?: boolean;
    }>;
  }) => void;
  getPermissionsAsync?: () => Promise<{ granted?: boolean; status?: string }>;
  requestPermissionsAsync?: () => Promise<{ granted?: boolean; status?: string }>;
  scheduleNotificationAsync?: (request: Record<string, unknown>) => Promise<string>;
  cancelScheduledNotificationAsync?: (id: string) => Promise<void>;
};

let notificationsHandlerConfigured = false;

function getOptionalNotificationsModule(): ExpoNotificationsModule | null {
  try {
    const runtimeRequire = new Function('return require;')() as (specifier: string) => ExpoNotificationsModule;

    return runtimeRequire('expo-notifications');
  } catch {
    return null;
  }
}

function mapPermissionStatus(result?: { granted?: boolean; status?: string }) {
  if (!result) {
    return 'unknown' as const;
  }

  if (result.granted || result.status === 'granted') {
    return 'granted' as const;
  }

  if (result.status === 'denied') {
    return 'denied' as const;
  }

  return 'unknown' as const;
}

function configureNotificationsHandler(notificationsModule: ExpoNotificationsModule | null) {
  if (!notificationsModule?.setNotificationHandler || notificationsHandlerConfigured) {
    return;
  }

  notificationsModule.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  notificationsHandlerConfigured = true;
}

export async function getLocalNotificationSupport(): Promise<ReminderNotificationSupport> {
  if (Platform.OS === 'web') {
    return {
      available: false,
      permissionStatus: 'unavailable',
      message: 'As notificações locais não ficam ativas nesta visualização web do app.',
    };
  }

  const notificationsModule = getOptionalNotificationsModule();

  if (!notificationsModule) {
    return {
      available: false,
      permissionStatus: 'unavailable',
      message: 'expo-notifications ainda não está instalado neste build.',
    };
  }

  configureNotificationsHandler(notificationsModule);

  try {
    const permissions = await notificationsModule.getPermissionsAsync?.();

    return {
      available: true,
      permissionStatus: mapPermissionStatus(permissions),
      message: null,
    };
  } catch {
    return {
      available: true,
      permissionStatus: 'unknown',
      message: 'Não foi possível ler a permissão de notificações agora.',
    };
  }
}

export async function requestLocalNotificationPermission(): Promise<ReminderNotificationSupport> {
  const support = await getLocalNotificationSupport();

  if (!support.available) {
    return support;
  }

  const notificationsModule = getOptionalNotificationsModule();

  if (!notificationsModule?.requestPermissionsAsync) {
    return {
      available: true,
      permissionStatus: 'unknown',
      message: 'A solicitação de permissão ainda não está disponível neste build.',
    };
  }

  try {
    const permission = await notificationsModule.requestPermissionsAsync();
    const permissionStatus = mapPermissionStatus(permission);

    return {
      available: true,
      permissionStatus,
      message:
        permissionStatus === 'granted'
          ? 'Permissão concedida. Seus lembretes podem aparecer como notificações locais.'
          : 'Sem permissão, os lembretes continuam salvos, mas as notificações locais ficam pausadas.',
    };
  } catch {
    return {
      available: true,
      permissionStatus: 'unknown',
      message: 'Não foi possível solicitar a permissão de notificações agora.',
    };
  }
}

export async function cancelReminderNotifications(notificationIds: string[]) {
  if (!notificationIds.length) {
    return;
  }

  const notificationsModule = getOptionalNotificationsModule();

  if (!notificationsModule?.cancelScheduledNotificationAsync) {
    return;
  }

  await Promise.allSettled(
    notificationIds.map((notificationId) => notificationsModule.cancelScheduledNotificationAsync?.(notificationId))
  );
}

export async function scheduleReminderNotifications(reminder: GlucoseReminder) {
  const support = await getLocalNotificationSupport();

  if (!support.available) {
    return {
      notificationIds: [] as string[],
      warning: support.message,
      permissionStatus: support.permissionStatus,
    };
  }

  if (support.permissionStatus !== 'granted') {
    return {
      notificationIds: [] as string[],
      warning: 'Ative as notificações para receber esse lembrete no horário escolhido.',
      permissionStatus: support.permissionStatus,
    };
  }

  const notificationsModule = getOptionalNotificationsModule();
  const parsedTime = parseReminderTime(reminder.time);

  if (!notificationsModule?.scheduleNotificationAsync || !parsedTime) {
    return {
      notificationIds: [] as string[],
      warning: 'Não foi possível agendar este lembrete agora.',
      permissionStatus: support.permissionStatus,
    };
  }

  const notificationIds: string[] = [];

  for (const day of sortReminderDays(reminder.days)) {
    const weekday = reminderWeekdayOptions.find((option) => option.key === day);

    if (!weekday) {
      continue;
    }

    const notificationId = await notificationsModule.scheduleNotificationAsync({
      content: {
        title: 'GlicoAí',
        body: reminder.message,
        data: {
          reminderId: reminder.id,
          context: reminder.context,
        },
      },
      trigger: {
        hour: parsedTime.hour,
        minute: parsedTime.minute,
        repeats: true,
        weekday: weekday.notificationWeekday,
      },
    });

    notificationIds.push(notificationId);
  }

  return {
    notificationIds,
    warning: null,
    permissionStatus: support.permissionStatus,
  };
}

export async function rescheduleReminderNotifications(reminder: GlucoseReminder, previousNotificationIds: string[]) {
  await cancelReminderNotifications(previousNotificationIds);

  if (!reminder.enabled) {
    const support = await getLocalNotificationSupport();

    return {
      notificationIds: [] as string[],
      warning: null,
      permissionStatus: support.permissionStatus,
    };
  }

  return scheduleReminderNotifications(reminder);
}
