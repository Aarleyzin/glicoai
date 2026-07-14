import { isSupabaseConfigured, supabase } from './client';

export async function getAuthenticatedUserId() {
  if (!supabase || !isSupabaseConfigured) {
    return {
      userId: null,
      error: 'Supabase não configurado.',
    };
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return {
      userId: null,
      error: error.message,
    };
  }

  if (!data.user) {
    return {
      userId: null,
      error: 'Nenhuma sessão autenticada encontrada.',
    };
  }

  return {
    userId: data.user.id,
    error: null,
  };
}
