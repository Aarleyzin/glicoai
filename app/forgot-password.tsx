import { useState } from 'react';

import { AppButton, AppCard, AppInput, AppText, AuthShell } from '../src/components';
import { isValidEmail } from '../src/features/auth/auth-validation';
import { useAppSession } from '../src/providers/app-session-provider';

export default function ForgotPasswordScreen() {
  const { authMessage, authMode, clearAuthMessage, isSupabaseConfigured, resetPassword } = useAppSession();
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleResetPassword() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setFormError('Digite seu email para enviar o link de recuperação.');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setFormError('Digite um email válido para continuar.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    clearAuthMessage();

    const result = await resetPassword(normalizedEmail);

    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.message);
    }
  }

  const notice = !isSupabaseConfigured ? (
    <AppCard tone="lavender">
      <AppText variant="caption" tone="muted">
        {authMode === 'local-fallback'
          ? 'A recuperação real de senha fica indisponível enquanto o app estiver em modo local.'
          : 'Configure o Supabase para ativar a recuperação real de senha.'}
      </AppText>
    </AppCard>
  ) : null;

  return (
    <AuthShell
      eyebrow="Suporte"
      title="Recuperar senha"
      subtitle="Enviaremos um link seguro para o seu email."
      notice={notice}
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
      <AppButton title="Enviar link" onPress={() => void handleResetPassword()} loading={isSubmitting} disabled={!isSupabaseConfigured} />
    </AuthShell>
  );
}
