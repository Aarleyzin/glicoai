import { useAppSettingsStore } from '../../stores/app-settings-store';
import { useGlucoseStore } from '../../stores/glucose-store';
import { useRemindersStore } from '../../stores/reminders-store';
import { useReportsStore } from '../../stores/reports-store';
import { useSubscriptionStore } from '../../stores/subscription-store';
import { removeSensitiveItem } from '../storage/sensitive-storage';
import { isSupabaseConfigured, supabase, SUPABASE_AUTH_STORAGE_KEY } from '../supabase/client';

export type DeleteAccountResult = {
  success: boolean;
  message: string;
};

function mapDeletionError(errorMessage?: string | null) {
  if (!errorMessage) {
    return 'Não foi possível excluir sua conta agora.';
  }

  if (/unauthorized|jwt|session/i.test(errorMessage)) {
    return 'Sua sessão expirou. Entre novamente antes de excluir a conta.';
  }

  return errorMessage;
}

async function clearLocalAccountData() {
  await Promise.allSettled([
    useGlucoseStore.getState().resetForDevelopment(),
    useRemindersStore.getState().resetForDevelopment(),
    useReportsStore.getState().resetForDevelopment(),
    useAppSettingsStore.getState().resetForDevelopment(),
    useSubscriptionStore.getState().resetForDevelopment(),
    removeSensitiveItem(SUPABASE_AUTH_STORAGE_KEY),
  ]);
}

export async function deleteCurrentAccount(): Promise<DeleteAccountResult> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      message: 'A exclusão de conta real depende de um projeto Supabase configurado.',
    };
  }

  const { data, error } = await supabase.functions.invoke('delete-account', {
    body: {
      confirm: true,
    },
  });

  if (error) {
    return {
      success: false,
      message: mapDeletionError(error.message),
    };
  }

  if (!data?.success) {
    return {
      success: false,
      message: mapDeletionError(data?.error ?? data?.message),
    };
  }

  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
  await clearLocalAccountData();

  return {
    success: true,
    message: 'Sua conta e os dados sincronizados foram removidos com sucesso.',
  };
}
