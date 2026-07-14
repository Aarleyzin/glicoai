import 'react-native-url-polyfill/auto';

import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { sensitiveSessionStorage } from '../storage/sensitive-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const isLocalAuthFallbackEnabled =
  __DEV__ || process.env.EXPO_PUBLIC_ENABLE_LOCAL_AUTH_FALLBACK === 'true';
export const SUPABASE_AUTH_STORAGE_KEY = 'glicoai-supabase-auth';

export function getSupabaseConfigMessage() {
  return 'Supabase ainda não configurado. Adicione EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY para ativar a autenticação real.';
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: sensitiveSessionStorage,
        storageKey: SUPABASE_AUTH_STORAGE_KEY,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
      },
    })
  : null;

if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
