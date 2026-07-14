import { Link, useRouter } from 'expo-router';
import { useState } from 'react';

import { AppButton, AppCard, AppInput, AppText, AuthShell } from '../src/components';
import { isValidEmail, validatePasswordForSignUp } from '../src/features/auth/auth-validation';
import { useAppSession } from '../src/providers/app-session-provider';

export default function RegisterScreen() {
  const router = useRouter();
  const { authMessage, authMode, clearAuthMessage, isSupabaseConfigured, signUp } = useAppSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password.trim()) {
      setFormError('Preencha nome, email e senha para criar sua conta.');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setFormError('Digite um email válido para criar sua conta.');
      return;
    }

    const passwordError = validatePasswordForSignUp(password);

    if (passwordError) {
      setFormError(passwordError);
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    clearAuthMessage();

    const result = await signUp({ name: normalizedName, email: normalizedEmail, password });

    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.message);
      return;
    }

    router.replace(result.session || authMode === 'local-fallback' ? '/health-profile-setup' : '/login');
  }

  const notice = !isSupabaseConfigured ? (
    <AppCard tone="lavender">
      <AppText variant="caption" tone="muted">
        {authMode === 'local-fallback'
          ? 'Supabase ainda não configurado. O cadastro simula uma conta local apenas para desenvolvimento.'
          : 'Supabase ainda não configurado. Configure as variáveis públicas para ativar o cadastro real.'}
      </AppText>
    </AppCard>
  ) : null;

  return (
    <AuthShell
      eyebrow="Boas-vindas"
      title="Criar conta"
      subtitle="Comece seu acompanhamento com uma conta segura."
      notice={notice}
      footer={
        <Link asChild href="/login">
          <AppButton title="Já tenho uma conta" variant="ghost" />
        </Link>
      }
    >
      <AppInput autoComplete="name" label="Nome" onChangeText={setName} placeholder="Como podemos chamar você?" value={name} />
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
        autoComplete="new-password"
        helperText="Use pelo menos 8 caracteres, com letras e números."
        label="Senha"
        onChangeText={setPassword}
        placeholder="Crie uma senha segura"
        secureTextEntry
        value={password}
      />
      {formError ? (
        <AppText variant="caption" tone="danger">
          {formError}
        </AppText>
      ) : null}
      {authMessage ? (
        <AppText variant="caption" tone="muted">
          {authMessage}
        </AppText>
      ) : null}
      <AppButton
        title="Continuar"
        onPress={() => void handleRegister()}
        loading={isSubmitting}
        disabled={!isSupabaseConfigured && authMode !== 'local-fallback'}
      />
    </AuthShell>
  );
}
