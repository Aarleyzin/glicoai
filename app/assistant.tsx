import { useEffect, useMemo, useState } from 'react';
import { Image, View } from 'react-native';

import { AppButton, AppCard, AppInput, AppScreen, AppText, EmptyState, ScreenHeader, StatusBadge } from '../src/components';
import { appMascot, spacing } from '../src/constants';
import { buildFutureOpenAIIntegrationNote } from '../src/services/ai/aiGuardrails';
import type { AssistantMessage, AssistantQuickAction } from '../src/services/ai/assistant-types';
import { assistantQuickActions } from '../src/services/ai/assistant-types';
import { answerAssistantPrompt, answerQuickAction, buildAssistantWelcome } from '../src/services/ai/localInsightGenerator';
import { getLockedFeatureMessage } from '../src/services/subscriptions/feature-gates';
import { useAppSettingsStore } from '../src/stores/app-settings-store';
import { useGlucoseStore } from '../src/stores/glucose-store';
import { useSubscriptionStore } from '../src/stores/subscription-store';
import { useAppTheme } from '../src/theme/app-theme';

function createMessage(role: AssistantMessage['role'], content: string, source: AssistantMessage['source']): AssistantMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    source,
    createdAt: new Date().toISOString(),
  };
}

export default function AssistantScreen() {
  const { colors } = useAppTheme();
  const readings = useGlucoseStore((state) => state.readings);
  const hasHydrated = useGlucoseStore((state) => state.hasHydrated);
  const unitPreference = useAppSettingsStore((state) => state.unitPreference);
  const targetRange = useAppSettingsStore((state) => state.targetRange);
  const userName = useAppSettingsStore((state) => state.healthProfile.name.trim() || 'Camila');
  const canUseAI = useSubscriptionStore((state) => state.gates.canUseAI);

  const assistantContext = useMemo(
    () => ({
      userName,
      unitPreference,
      targetRange,
      readings,
    }),
    [readings, targetRange, unitPreference, userName]
  );

  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [hasInitializedConversation, setHasInitializedConversation] = useState(false);

  useEffect(() => {
    if (!hasHydrated || hasInitializedConversation) {
      return;
    }

    setMessages([createMessage('assistant', buildAssistantWelcome(assistantContext), 'system')]);
    setHasInitializedConversation(true);
  }, [assistantContext, hasHydrated, hasInitializedConversation]);

  const integrationNote = buildFutureOpenAIIntegrationNote();

  function handleQuickAction(action: AssistantQuickAction) {
    const nextAnswer = answerQuickAction(action, assistantContext);

    setMessages((currentMessages) => [
      ...currentMessages,
      createMessage('user', action, 'quick-action'),
      createMessage('assistant', nextAnswer.content, nextAnswer.source),
    ]);
  }

  function handleSendQuestion() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setInputError('Escreva uma pergunta para eu olhar seus registros com você.');
      return;
    }

    const answer = answerAssistantPrompt(trimmedQuestion, assistantContext);

    setMessages((currentMessages) => [
      ...currentMessages,
      createMessage('user', trimmedQuestion, 'freeform'),
      createMessage('assistant', answer.content, answer.source),
    ]);
    setQuestion('');
    setInputError(null);
  }

  return (
    <AppScreen>
      <ScreenHeader title="Assistente GlicoAí" subtitle="Entenda seus registros com mais clareza." eyebrow="Apoio" />

      {!canUseAI ? (
        <AppCard tone="cream">
          <AppText variant="subtitle">Análise local segura</AppText>
          <AppText variant="body" tone="muted">
            {getLockedFeatureMessage('canUseAI')}
          </AppText>
        </AppCard>
      ) : null}

      <AppCard tone="lavender">
        <View style={{ gap: spacing.xs }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: spacing.sm }}>
            <Image source={appMascot.curious} style={{ height: 52, resizeMode: 'contain', width: 52 }} />
            <AppText variant="subtitle">Ações rápidas</AppText>
          </View>
          <AppText variant="caption" tone="muted">
            Use um atalho para resumir padrões dos seus registros com linguagem segura e clara.
          </AppText>
        </View>

        <View style={{ gap: spacing.sm }}>
          {assistantQuickActions.map((action) => (
            <AppCard key={action} onPress={() => handleQuickAction(action)} pressable style={{ gap: spacing.xs }} tone="white">
              <AppText variant="subtitle">{action}</AppText>
              <AppText variant="caption" tone="muted">
                {action === 'Resumo da semana' && 'Mostra média, tempo no alvo e uma comparação simples com o período anterior.'}
                {action === 'O que meus números mostram?' &&
                  'Destaca contextos, variações e leituras fora do alvo como tendências, nunca como diagnóstico.'}
                {action === 'Perguntas para levar ao médico' &&
                  'Transforma seus registros em perguntas mais úteis para uma conversa clínica.'}
                {action === 'Explicar meu progresso' &&
                  'Resume consistência, tempo no alvo e o que parece ter melhorado ou pedido mais atenção.'}
                {action === 'Gerar hábitos de registro' &&
                  'Sugere pequenos ajustes para registrar com mais constância ao longo da semana.'}
              </AppText>
            </AppCard>
          ))}
        </View>
      </AppCard>

      <View style={{ gap: spacing.sm }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' }}>
          <AppText variant="subtitle">Conversa</AppText>
          <StatusBadge label="Análise segura" tone="mint" />
        </View>

        {!messages.length ? (
          <EmptyState
            title="Preparando o assistente"
            message="Assim que os dados locais estiverem disponíveis, eu começo a conversa com um resumo seguro."
          />
        ) : (
          <View style={{ gap: spacing.md }}>
            {messages.map((message) => (
              <AppCard
                key={message.id}
                tone={message.role === 'assistant' ? 'white' : 'mint'}
                style={{
                  alignSelf: message.role === 'assistant' ? 'stretch' : 'flex-end',
                  maxWidth: '92%',
                }}
              >
                <View style={{ alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' }}>
                  <AppText variant="label" tone="muted">
                    {message.role === 'assistant' ? 'Assistente GlicoAí' : 'Você'}
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </AppText>
                </View>
                <AppText variant="body">{message.content}</AppText>
              </AppCard>
            ))}
          </View>
        )}
      </View>

      <AppCard tone="cream">
        <AppInput
          errorText={inputError ?? undefined}
          helperText="O GlicoAí não substitui orientação médica."
          label="Pergunta"
          multiline
          onChangeText={(value) => {
            setQuestion(value);
            if (inputError) {
              setInputError(null);
            }
          }}
          placeholder="Ex.: O que meus registros desta semana parecem mostrar?"
          style={{ minHeight: 76, textAlignVertical: 'top' }}
          value={question}
        />

        <AppButton title="Enviar" onPress={handleSendQuestion} />
      </AppCard>

      <AppCard tone="white">
        <AppText variant="caption" tone="muted">
          {integrationNote.nextStep}
        </AppText>
      </AppCard>

      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderCurve: 'continuous',
          borderRadius: 16,
          borderWidth: 1,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }}
      >
        <AppText variant="caption" tone="muted" align="center">
          O GlicoAí não substitui orientação médica.
        </AppText>
      </View>
    </AppScreen>
  );
}

