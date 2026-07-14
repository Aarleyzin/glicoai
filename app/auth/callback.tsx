import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppButton, AppCard, AppScreen, AppText } from '../../src/components';
import { spacing } from '../../src/constants/spacing';
import { isSupabaseConfigured, supabase } from '../../src/services/supabase/client';

type CallbackStatus = 'loading' | 'success' | 'error';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [message, setMessage] = useState('Confirmando sua sessão com segurança...');

  useEffect(() => {
    let active = true;

    async function handleCallback() {
      if (!supabase || !isSupabaseConfigured) {
        if (!active) return;
        setStatus('error');
        setMessage('Supabase ainda não está configurado neste ambiente.');
        return;
      }

      const errorDescription = Array.isArray(params.error_description)
        ? params.error_description[0]
        : params.error_description;

      if (errorDescription) {
        if (!active) return;
        setStatus('error');
        setMessage(errorDescription);
        return;
      }

      const code = Array.isArray(params.code) ? params.code[0] : params.code;

      if (!code) {
        const { data } = await supabase.auth.getSession();

        if (!active) return;

        if (data.session) {
          setStatus('success');
          setMessage('Sessão confirmada. Você já pode continuar.');
          setTimeout(() => router.replace('/health-profile-setup'), 700);
          return;
        }

        setStatus('error');
        setMessage('Não encontramos um código válido neste link. Peça um novo link e tente novamente.');
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!active) return;

      if (error) {
        setStatus('error');
        setMessage(error.message);
        return;
      }

      setStatus('success');
      setMessage('Sessão confirmada. Você já pode continuar.');
      setTimeout(() => router.replace('/health-profile-setup'), 700);
    }

    handleCallback();

    return () => {
      active = false;
    };
  }, [params.code, params.error_description, router]);

  return (
    <AppScreen>
      <View style={styles.container}>
        <AppCard style={styles.card}>
          <AppText variant="label" tone="muted">
            GlicoAí
          </AppText>
          <AppText variant="title">
            {status === 'success' ? 'Tudo certo por aqui' : status === 'error' ? 'Não foi possível continuar' : 'Só um instante'}
          </AppText>
          <AppText tone="muted" style={styles.message}>
            {message}
          </AppText>

          {status === 'error' ? (
            <AppButton title="Voltar para o login" onPress={() => router.replace('/login')} />
          ) : null}
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    gap: spacing.md,
  },
  message: {
    lineHeight: 22,
  },
});

