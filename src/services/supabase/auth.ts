import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import { getSupabaseConfigMessage, isSupabaseConfigured, supabase } from './client';

export type AuthActionResult = {
  success: boolean;
  message: string;
  session?: Session | null;
};

function mapAuthErrorMessage(errorMessage?: string | null) {
  if (!errorMessage) {
    return 'Não foi possível concluir essa etapa de autenticação agora.';
  }

  if (/invalid login credentials/i.test(errorMessage)) {
    return 'Email ou senha inválidos. Revise os dados e tente de novo.';
  }

  if (/email not confirmed/i.test(errorMessage)) {
    return 'Sua conta ainda precisa confirmar o email antes de entrar.';
  }

  if (/user already registered/i.test(errorMessage)) {
    return 'Já existe uma conta com esse email. Tente entrar ou recuperar a senha.';
  }

  if (/password should be at least/i.test(errorMessage)) {
    return 'Escolha uma senha um pouco mais forte para criar sua conta.';
  }

  return errorMessage;
}

function getMissingConfigResult(messageOverride?: string): AuthActionResult {
  return {
    success: false,
    message: messageOverride ?? getSupabaseConfigMessage(),
    session: null,
  };
}

export function getAuthRedirectUrl() {
  return Linking.createURL('/auth/callback');
}

export async function signUp(params: { email: string; password: string; name?: string }): Promise<AuthActionResult> {
  if (!supabase || !isSupabaseConfigured) {
    return getMissingConfigResult();
  }

  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      data: {
        name: params.name?.trim() || undefined,
      },
    },
  });

  if (error) {
    return {
      success: false,
      message: mapAuthErrorMessage(error.message),
      session: null,
    };
  }

  if (data.session) {
    return {
      success: true,
      message: 'Conta criada e sessão iniciada com sucesso.',
      session: data.session,
    };
  }

  return {
    success: true,
    message: 'Conta criada. Verifique seu email para confirmar o cadastro, se essa etapa estiver habilitada no projeto.',
    session: data.session,
  };
}

export async function signIn(params: { email: string; password: string }): Promise<AuthActionResult> {
  if (!supabase || !isSupabaseConfigured) {
    return getMissingConfigResult();
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });

  if (error) {
    return {
      success: false,
      message: mapAuthErrorMessage(error.message),
      session: null,
    };
  }

  return {
    success: true,
    message: 'Sessão iniciada com sucesso.',
    session: data.session,
  };
}

export async function signOut(): Promise<AuthActionResult> {
  if (!supabase || !isSupabaseConfigured) {
    return getMissingConfigResult();
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      message: mapAuthErrorMessage(error.message),
      session: null,
    };
  }

  return {
    success: true,
    message: 'Sessão encerrada com sucesso.',
    session: null,
  };
}

export async function resetPassword(email: string): Promise<AuthActionResult> {
  if (!supabase || !isSupabaseConfigured) {
    return getMissingConfigResult();
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectUrl(),
  });

  if (error) {
    return {
      success: false,
      message: mapAuthErrorMessage(error.message),
      session: null,
    };
  }

  return {
    success: true,
    message: 'Se existir uma conta com esse email, o link de recuperação será enviado.',
    session: null,
  };
}

export async function getSession(): Promise<AuthActionResult> {
  if (!supabase || !isSupabaseConfigured) {
    return getMissingConfigResult();
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return {
      success: false,
      message: mapAuthErrorMessage(error.message),
      session: null,
    };
  }

  return {
    success: true,
    message: data.session ? 'Sessão restaurada.' : 'Nenhuma sessão ativa encontrada.',
    session: data.session,
  };
}

export function listenAuthChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  if (!supabase || !isSupabaseConfigured) {
    return {
      data: {
        subscription: {
          unsubscribe: () => undefined,
        },
      },
    };
  }

  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
