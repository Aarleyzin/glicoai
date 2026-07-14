import type { RemoteMutationResult, SyncResult } from '../sync/sync-types';
import { supabase } from '../supabase/client';
import { getAuthenticatedUserId } from '../supabase/session';

export type AiInsightInput = {
  period: string;
  content: string;
};

export async function createAiInsight(input: AiInsightInput): Promise<SyncResult<RemoteMutationResult>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (!userId || !supabase) {
    return {
      data: null,
      error: userError,
      pendingSync: true,
    };
  }

  const { data, error } = await supabase
    .from('ai_insights')
    .insert({
      user_id: userId,
      period: input.period,
      content: input.content,
    })
    .select('id')
    .single();

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

export async function fetchAiInsights() {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (!userId || !supabase) {
    return {
      data: [],
      error: userError,
    };
  }

  const { data, error } = await supabase.from('ai_insights').select('*').eq('user_id', userId).order('created_at', {
    ascending: false,
  });

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}
