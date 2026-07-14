import type { GlucoseUnit } from '../../features/glucose/glucose-types';
import type { HealthProfile, TargetRange } from '../../features/profile/profile-types';
import type { RemoteMutationResult, SyncResult } from '../sync/sync-types';
import { supabase } from '../supabase/client';
import { getAuthenticatedUserId } from '../supabase/session';

type ProfilePayload = {
  healthProfile: HealthProfile;
  unitPreference: GlucoseUnit;
  targetRange: TargetRange;
};

function parseBirthDate(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const match = trimmedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
}

function mapProfileToRow(payload: ProfilePayload, userId: string) {
  return {
    user_id: userId,
    name: payload.healthProfile.name,
    birth_date: parseBirthDate(payload.healthProfile.birthDate),
    tracking_type: payload.healthProfile.trackingType,
    unit_preference: payload.unitPreference,
    target_min: payload.targetRange.min,
    target_max: payload.targetRange.max,
    uses_insulin: payload.healthProfile.usesInsulin,
    uses_medication: payload.healthProfile.usesMedication,
  };
}

export async function upsertProfile(payload: ProfilePayload): Promise<SyncResult<RemoteMutationResult>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (!userId || !supabase) {
    return {
      data: null,
      error: userError,
      pendingSync: true,
    };
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(mapProfileToRow(payload, userId), {
      onConflict: 'user_id',
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

export async function fetchProfile() {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (!userId || !supabase) {
    return {
      data: null,
      error: userError,
    };
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();

  return {
    data,
    error: error?.message ?? null,
  };
}

export async function deleteProfile() {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (!userId || !supabase) {
    return {
      error: userError,
      pendingSync: true,
    };
  }

  const { error } = await supabase.from('profiles').delete().eq('user_id', userId);

  return {
    error: error?.message ?? null,
    pendingSync: Boolean(error),
  };
}
