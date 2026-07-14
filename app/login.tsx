import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppButton, AppCard, AppInput, AppText, AuthShell } from '../src/components';
import { spacing } from '../src/constants';
import { isValidEmail } from '../src/features/auth/auth-validation';
import { useAppSession } from '../src/providers/app-session-provider';
import { useAppTheme } from '../src/theme/app-theme';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { authMessage, authMode, clearAuthMessage, isSupabaseConfigured, signIn } = useAppSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      setFormError('Preencha email e senha para entrar.');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setFormError('Digite um email válido para entrar.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    clearAuthMessage();

    const result = await signIn({ email: normalizedEmail, password });

    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.message);
      return;
    }

    router.replace('/health-profile-setup');
  }

  const notice = !isSupabaseConfigured ? (
    <AppCard tone="lavender">
      <AppText variant="caption" tone="muted">
        {authMode === 'local-fallback'
          ? 'Supabase ainda não configurado. Este login entra em modo local apenas para desenvolvimento.'
          : 'Supabase ainda não configurado. Configure as variáveis públicas para ativar o login real.'}
      </AppText>
    </AppCard>
  ) : null;

  return (
    <AuthShell
      eyebrow="Acesso seguro"
      title="Entrar"
      subtitle="Continue acompanhando seus registros com clareza."
      notice={notice}
      footer={
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: spacing.xs, justifyContent: 'center' }}>
          <AppText variant="body" tone="muted">
            Ainda não tem conta?
          </AppText>
          <Link asChild href="/register">
            <AppText variant="body" weight="semibold" style={{ color: colors.accent }}>
              Criar conta
            </AppText>
          </Link>
        </View>
      }
    >
      <AppInput
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        label="Email"
        onChangeText={setEmail}
        placeholder="seu@email.com"
        value={email}
      />
      <AppInput
        autoComplete="current-password"
        label="Senha"
        onChangeText={setPassword}
        placeholder="Digite sua senha"
        secureTextEntry
        value={password}
      />
      <Link asChild href="/forgot-password">
        <AppText variant="caption" weight="semibold" style={{ alignSelf: 'flex-start', color: colors.accent }}>
          Esqueci minha senha
        </AppText>
      </Link>
      {formError ? (
        <AppText variant="caption" tone="danger">
          {formError}
        </AppText>
      ) : null}
      {authMessage && authMode === 'local-fallback' ? (
        <AppText variant="caption" tone="muted">
          {authMessage}
        </AppText>
      ) : null}
      <AppButton
        title="Entrar"
        onPress={() => void handleLogin()}
        loading={isSubmitting}
        disabled={!isSupabaseConfigured && authMode !== 'local-fallback'}
      />
    </AuthShell>
  );
}
