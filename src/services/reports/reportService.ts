import type { RemoteMutationResult, SyncResult } from '../sync/sync-types';
import { supabase } from '../supabase/client';
import { getAuthenticatedUserId } from '../supabase/session';

export type ReportRecordInput = {
  remoteId?: string;
  period: string;
  fileUrl?: string | null;
};

function isUuid(value: string | undefined) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

export async function createReportRecord(input: ReportRecordInput): Promise<SyncResult<RemoteMutationResult>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (!userId || !supabase) {
    return {
      data: null,
      error: userError,
      pendingSync: true,
    };
  }

  const row = {
    ...(isUuid(input.remoteId) ? { id: input.remoteId } : null),
    user_id: userId,
    period: input.period,
    file_url: input.fileUrl ?? null,
  };

  const { data, error } = await supabase.from('reports').insert(row).select('id').single();

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

export async function fetchReports() {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (!userId || !supabase) {
    return {
      data: [],
      error: userError,
    };
  }

  const { data, error } = await supabase.from('reports').select('*').eq('user_id', userId).order('created_at', {
    ascending: false,
  });

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}

export async function deleteReport(remoteId: string | undefined) {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (!remoteId || !userId || !supabase) {
    return {
      error: userError ?? 'Relatorio sem remoteId para excluir no Supabase.',
      pendingSync: true,
    };
  }

  const { error } = await supabase.from('reports').delete().eq('id', remoteId).eq('user_id', userId);

  return {
    error: error?.message ?? null,
    pendingSync: Boolean(error),
  };
}
