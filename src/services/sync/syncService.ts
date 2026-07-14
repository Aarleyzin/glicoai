import { useAppSettingsStore } from '../../stores/app-settings-store';
import { useGlucoseStore } from '../../stores/glucose-store';
import { useRemindersStore } from '../../stores/reminders-store';
import { useReportsStore } from '../../stores/reports-store';
import { isSupabaseConfigured } from '../supabase/client';
import { getAuthenticatedUserId } from '../supabase/session';

export async function syncPendingLocalData() {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase não configurado. Dados locais permanecem pendentes para sincronização futura.',
    };
  }

  const { userId, error } = await getAuthenticatedUserId();

  if (!userId) {
    return {
      success: false,
      message: error ?? 'Nenhuma sessão autenticada para sincronizar dados locais.',
    };
  }

  await useAppSettingsStore.getState().syncPendingProfile();
  await useGlucoseStore.getState().syncPendingReadings();
  await useRemindersStore.getState().syncPendingReminders();
  await useReportsStore.getState().syncPendingReports();

  return {
    success: true,
    message: 'Sincronização local concluída.',
  };
}
