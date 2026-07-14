import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppButton, AppCard, AppInput, AppScreen, AppText, ScreenHeader } from '../src/components';
import { spacing } from '../src/constants';
import { useAppSession } from '../src/providers/app-session-provider';
import { deleteCurrentAccount } from '../src/services/account/accountDeletionService';

const DELETE_CONFIRMATION = 'EXCLUIR';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { authMode, isSupabaseConfigured, session } = useAppSession();
  const [confirmationText, setConfirmationText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canDeleteAccount = isSupabaseConfigured && authMode === 'supabase' && Boolean(session);

  async function handleDeleteAccount() {
    if (confirmationText.trim().toUpperCase() !== DELETE_CONFIRMATION) {
      setFeedback('Digite EXCLUIR para confirmar a remoção definitiva da conta.');
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const result = await deleteCurrentAccount();

    setIsSubmitting(false);
    setFeedback(result.message);

    if (result.success) {
      router.replace('/onboarding');
    }
  }

  return (
    <AppScreen>
      <ScreenHeader
        title="Excluir conta"
        subtitle="Remova sua conta com segurança quando precisar encerrar o uso do app."
        eyebrow="Segurança"
      />

      <AppCard tone="coral">
        <View style={{ gap: spacing.sm }}>
          <AppText variant="subtitle">Esta ação é definitiva</AppText>
          <AppText variant="body" tone="muted">
            Ao continuar, o GlicoAí remove sua conta no Supabase e limpa os dados locais deste dispositivo.
          </AppText>
          <AppText variant="caption" tone="muted">
            Se você tiver sintomas, dúvidas clínicas ou precisar manter um histórico médico, exporte os dados antes da exclusão.
          </AppText>
        </View>
      </AppCard>

      {!canDeleteAccount ? (
        <AppCard tone="lavender">
          <AppText variant="caption" tone="muted">
            {!isSupabaseConfigured
              ? 'A exclusão real depende de um projeto Supabase configurado.'
              : 'Entre com uma sessão válida para concluir a exclusão da conta.'}
          </AppText>
        </AppCard>
      ) : null}

      <AppCard>
        <View style={{ gap: spacing.md }}>
          <AppInput
            autoCapitalize="characters"
            autoCorrect={false}
            helperText="Digite EXCLUIR para confirmar."
            label="Confirmação"
            onChangeText={setConfirmationText}
            placeholder="EXCLUIR"
            value={confirmationText}
          />

          {feedback ? (
            <AppText variant="caption" tone={canDeleteAccount ? 'danger' : 'muted'}>
              {feedback}
            </AppText>
          ) : null}

          <AppButton
            title="Excluir conta definitivamente"
            variant="danger"
            onPress={() => void handleDeleteAccount()}
            loading={isSubmitting}
            disabled={!canDeleteAccount}
          />

          <AppButton title="Voltar para configurações" variant="ghost" onPress={() => router.back()} />
        </View>
      </AppCard>
    </AppScreen>
  );
}
