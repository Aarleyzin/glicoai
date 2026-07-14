import type { GlucoseReminder, ReminderDraft, ReminderWeekday } from './reminder-types';
import { reminderMessageSuggestions, reminderWeekdayOptions } from './reminder-types';

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function validateReminderDraft(draft: ReminderDraft) {
  if (!timePattern.test(draft.time.trim())) {
    return 'Escolha um horário válido no formato HH:MM.';
  }

  if (!draft.days.length) {
    return 'Selecione pelo menos um dia da semana.';
  }

  if (!draft.message.trim()) {
    return 'Escolha ou escreva uma mensagem amigável para o lembrete.';
  }

  return null;
}

export function parseReminderTime(time: string) {
  const match = time.trim().match(timePattern);

  if (!match) {
    return null;
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

export function sortReminderDays(days: ReminderWeekday[]) {
  return [...days].sort((left, right) => {
    const leftOption = reminderWeekdayOptions.find((option) => option.key === left);
    const rightOption = reminderWeekdayOptions.find((option) => option.key === right);

    return (leftOption?.order ?? 99) - (rightOption?.order ?? 99);
  });
}

export function formatReminderDays(days: ReminderWeekday[]) {
  return sortReminderDays(days)
    .map((day) => reminderWeekdayOptions.find((option) => option.key === day)?.label ?? day)
    .join(', ');
}

export function createReminderId() {
  return `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultReminderDraft(): ReminderDraft {
  return {
    time: '07:30',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    context: 'Jejum',
    message: reminderMessageSuggestions[0],
    enabled: true,
  };
}

export function createReminderFromDraft(draft: ReminderDraft): Omit<GlucoseReminder, 'id' | 'createdAt' | 'updatedAt' | 'notificationIds'> {
  return {
    time: draft.time.trim(),
    days: sortReminderDays(draft.days),
    context: draft.context,
    message: draft.message.trim(),
    enabled: draft.enabled,
  };
}
