import type { GlucoseReading } from '../../features/glucose/glucose-types';
import type { RemoteMutationResult, SyncResult } from '../sync/sync-types';
import { supabase } from '../supabase/client';
import { getAuthenticatedUserId } from '../supabase/session';

function isUuid(value: string | undefined) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function mapReadingToRow(reading: GlucoseReading, userId: string) {
  return {
    ...(isUuid(reading.remoteId) ? { id: reading.remoteId } : null),
    user_id: userId,
    value: reading.value,
    unit: reading.unit,
    measured_at: reading.measuredAt,
    context: reading.context,
    mood: reading.mood,
    note: reading.note,
    status: reading.status,
    created_at: reading.createdAt,
  };
}

export async function upsertGlucoseReading(reading: GlucoseReading): Promise<SyncResult<RemoteMutationResult>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (!userId || !supabase) {
    return {
      data: null,
      error: userError,
      pendingSync: true,
    };
  }

  const query = supabase.from('glucose_readings');
  const row = mapReadingToRow(reading, userId);

  const { data, error } = isUuid(reading.remoteId)
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

export async function fetchGlucoseReadings() {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (!userId || !supabase) {
    return {
      data: [],
      error: userError,
    };
  }

  const { data, error } = await supabase
    .from('glucose_readings')
    .select('*')
    .eq('user_id', userId)
    .order('measured_at', { ascending: false });

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}

export async function deleteGlucoseReading(remoteId: string | undefined) {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (!remoteId || !userId || !supabase) {
    return {
      error: userError ?? 'Leitura sem remoteId para excluir no Supabase.',
      pendingSync: true,
    };
  }

  const { error } = await supabase.from('glucose_readings').delete().eq('id', remoteId).eq('user_id', userId);

  return {
    error: error?.message ?? null,
    pendingSync: Boolean(error),
  };
}
