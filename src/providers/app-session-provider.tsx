import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { AuthActionResult } from '../services/supabase/auth';
import {
  getSession as getSupabaseSession,
  listenAuthChanges,
  resetPassword as resetSupabasePassword,
  signIn as signInWithSupabase,
  signOut as signOutFromSupabase,
  signUp as signUpWithSupabase,
} from '../services/supabase/auth';
import { getSupabaseConfigMessage, isLocalAuthFallbackEnabled, isSupabaseConfigured } from '../services/supabase/client';
import { syncPendingLocalData } from '../services/sync/syncService';
import { useAppSettingsStore } from '../stores/app-settings-store';

type AuthMode = 'supabase' | 'local-fallback' | 'disabled';

const AUTH_BOOTSTRAP_TIMEOUT_MS = 5000;

type AppSessionValue = {
  hasSeenOnboarding: boolean;
  isAuthenticated: boolean;
  hasCompletedHealthProfile: boolean;
  userName: string;
  authReady: boolean;
  authMode: AuthMode;
  isSupabaseConfigured: boolean;
  authMessage: string | null;
  session: Session | null;
  completeOnboarding: () => void;
  signIn: (params: { email: string; password: string }) => Promise<AuthActionResult>;
  signUp: (params: { email: string; password: string; name?: string }) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
  resetPassword: (email: string) => Promise<AuthActionResult>;
  getSession: () => Promise<AuthActionResult>;
  listenAuthChanges: (callback: (event: AuthChangeEvent, session: Session | null) => void) => () => void;
  completeHealthProfile: () => void;
  clearAuthMessage: () => void;
};

const AppSessionContext = createContext<AppSessionValue | null>(null);

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

export function AppSessionProvider({ children }: PropsWithChildren) {
  const hasSeenOnboarding = useAppSettingsStore((state) => state.hasSeenOnboarding);
  const localIsAuthenticated = useAppSettingsStore((state) => state.isAuthenticated);
  const hasCompletedHealthProfile = useAppSettingsStore((state) => state.hasCompletedHealthProfile);
  const healthProfileName = useAppSettingsStore((state) => state.healthProfile.name);
  const completeOnboarding = useAppSettingsStore((state) => state.completeOnboarding);
  const fallbackSignIn = useAppSettingsStore((state) => state.signIn);
  const fallbackSignOut = useAppSettingsStore((state) => state.signOut);
  const completeHealthProfile = useAppSettingsStore((state) => state.completeHealthProfile);
  const userName = healthProfileName || 'Camila';

  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setAuthReady(true);
        }
        return;
      }

      try {
        const result = await withTimeout(
          getSupabaseSession(),
          AUTH_BOOTSTRAP_TIMEOUT_MS,
          'Não foi possível restaurar sua sessão agora. Entre novamente para continuar.'
        );

        if (!isMounted) {
          return;
        }

        setSession(result.session ?? null);
        setAuthMessage(result.success ? null : result.message);

        if (result.session) {
          fallbackSignIn();
          void syncPendingLocalData();
        } else {
          fallbackSignOut();
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setSession(null);
        fallbackSignOut();
        setAuthMessage(error instanceof Error ? error.message : 'Não foi possível restaurar sua sessão agora.');
      } finally {
        if (isMounted) {
          setAuthReady(true);
        }
      }
    }

    void bootstrapAuth();

    const { data } = listenAuthChanges((event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setAuthReady(true);

      if (nextSession) {
        fallbackSignIn();
        void syncPendingLocalData();
      } else {
        fallbackSignOut();
      }

      if (event === 'SIGNED_OUT') {
        setAuthMessage('Sessão encerrada com sucesso.');
      } else if (event === 'PASSWORD_RECOVERY') {
        setAuthMessage('Sua conta entrou em modo de recuperação de senha.');
      } else if (event === 'SIGNED_IN') {
        setAuthMessage(null);
      }
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [fallbackSignIn, fallbackSignOut]);

  const authMode: AuthMode = isSupabaseConfigured ? 'supabase' : isLocalAuthFallbackEnabled ? 'local-fallback' : 'disabled';
  const isAuthenticated = isSupabaseConfigured
    ? Boolean(session)
    : isLocalAuthFallbackEnabled
      ? localIsAuthenticated
      : false;

  async function signIn(params: { email: string; password: string }) {
    if (!isSupabaseConfigured && isLocalAuthFallbackEnabled) {
      const fallbackMessage = 'Supabase ainda não configurado. Entramos em modo local para desenvolvimento.';
      fallbackSignIn();
      setAuthMessage(fallbackMessage);
      setAuthReady(true);
      return {
        success: true,
        message: fallbackMessage,
        session: null,
      };
    }

    const result = await signInWithSupabase(params);

    setSession(result.session ?? null);
    setAuthMessage(result.message);

    if (result.success && result.session) {
      fallbackSignIn();
      void syncPendingLocalData();
    }

    return result;
  }

  async function signUp(params: { email: string; password: string; name?: string }) {
    if (!isSupabaseConfigured && isLocalAuthFallbackEnabled) {
      const fallbackMessage = 'Supabase ainda não configurado. Conta simulada localmente para desenvolvimento.';
      fallbackSignIn();
      setAuthMessage(fallbackMessage);
      setAuthReady(true);
      return {
        success: true,
        message: fallbackMessage,
        session: null,
      };
    }

    const result = await signUpWithSupabase(params);

    setSession(result.session ?? null);
    setAuthMessage(result.message);

    if (result.success && result.session) {
      fallbackSignIn();
      void syncPendingLocalData();
    }

    return result;
  }

  async function signOut() {
    if (!isSupabaseConfigured && isLocalAuthFallbackEnabled) {
      fallbackSignOut();
      const fallbackMessage = 'Sessão local encerrada neste dispositivo.';
      setAuthMessage(fallbackMessage);
      setAuthReady(true);

      return {
        success: true,
        message: fallbackMessage,
        session: null,
      };
    }

    const result = await signOutFromSupabase();

    if (result.success) {
      setSession(null);
      fallbackSignOut();
    }

    setAuthMessage(result.message);
    setAuthReady(true);

    return result;
  }

  async function resetPassword(email: string) {
    const result = await resetSupabasePassword(email);
    setAuthMessage(result.message);
    return result;
  }

  async function getSession() {
    const result = await getSupabaseSession();

    if (isSupabaseConfigured) {
      setSession(result.session ?? null);
      if (result.session) {
        fallbackSignIn();
        void syncPendingLocalData();
      }
    } else if (!isLocalAuthFallbackEnabled) {
      setSession(null);
      fallbackSignOut();
      setAuthMessage(getSupabaseConfigMessage());
    }

    setAuthMessage(result.success ? null : result.message);

    return result;
  }

  function subscribeAuthChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    const { data } = listenAuthChanges(callback);
    return () => data.subscription.unsubscribe();
  }

  function clearAuthMessage() {
    setAuthMessage(null);
  }

  const value = useMemo<AppSessionValue>(
    () => ({
      hasSeenOnboarding,
      isAuthenticated,
      hasCompletedHealthProfile,
      userName,
      authReady,
      authMode,
      isSupabaseConfigured,
      authMessage,
      session,
      completeOnboarding,
      signIn,
      signUp,
      signOut,
      resetPassword,
      getSession,
      listenAuthChanges: subscribeAuthChanges,
      completeHealthProfile,
      clearAuthMessage,
    }),
    [
      hasSeenOnboarding,
      isAuthenticated,
      hasCompletedHealthProfile,
      userName,
      authReady,
      authMode,
      authMessage,
      session,
      completeOnboarding,
      completeHealthProfile,
    ]
  );

  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
}

export function useAppSession() {
  const context = useContext(AppSessionContext);

  if (!context) {
    throw new Error('useAppSession must be used within AppSessionProvider');
  }

  return context;
}
