import type { GlucoseReminder } from '../../features/reminders/reminder-types';
import type { RemoteMutationResult, SyncResult } from '../sync/sync-types';
import { supabase } from '../supabase/client';
import { getAuthenticatedUserId } from '../supabase/session';

function isUuid(value: string | undefined) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function mapReminderToRow(reminder: GlucoseReminder, userId: string) {
  return {
    ...(isUuid(reminder.remoteId) ? { id: reminder.remoteId } : null),
    user_id: userId,
    title: reminder.message,
    time: reminder.time,
    days: reminder.days,
    context: reminder.context,
    enabled: reminder.enabled,
    notification_id: reminder.notificationIds[0] ?? null,
    created_at: reminder.createdAt,
  };
}

export async function upsertReminder(reminder: GlucoseReminder): Promise<SyncResult<RemoteMutationResult>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (!userId || !supabase) {
    return {
      data: null,
      error: userError,
      pendingSync: true,
    };
  }

  const query = supabase.from('reminders');
  const row = mapReminderToRow(reminder, userId);
  const { data, error } = isUuid(reminder.remoteId)
    ? await query.upsert(row).select('id').single()
    : await query.insert(row).select('id').single();

  if (error) {
    return {
      data: null,
      error: error.message,
      pendingSync: true,
    };
  }

  return {
    data: {
      remoteId: data.id,
      syncedAt: new Date().toISOString(),
    },
    error: null,
    pendingSync: false,
  };
}

export async function fetchReminders() {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (!userId || !supabase) {
    return {
      data: [],
      error: userError,
    };
  }

  const { data, error } = await supabase.from('reminders').select('*').eq('user_id', userId).order('time');

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}

export async function deleteReminder(remoteId: string | undefined) {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (!remoteId || !userId || !supabase) {
    return {
      error: userError ?? 'Lembrete sem remoteId para excluir no Supabase.',
      pendingSync: true,
    };
  }

  const { error } = await supabase.from('reminders').delete().eq('id', remoteId).eq('user_id', userId);

  return {
    error: error?.message ?? null,
    pendingSync: Boolean(error),
  };
}
