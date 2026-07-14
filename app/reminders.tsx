import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Switch, View } from 'react-native';

import {
  AppButton,
  AppCard,
  AppChip,
  AppInput,
  AppScreen,
  AppText,
  EmptyState,
  ScreenHeader,
  StatusBadge,
} from '../src/components';
import { appMascot, colors, radius, spacing } from '../src/constants';
import {
  reminderContexts,
  reminderMessageSuggestions,
  reminderWeekdayOptions,
  type GlucoseReminder,
  type ReminderDraft,
  type ReminderNotificationSupport,
  type ReminderWeekday,
} from '../src/features/reminders/reminder-types';
import {
  createDefaultReminderDraft,
  formatReminderDays,
  validateReminderDraft,
} from '../src/features/reminders/reminder-utils';
import { getLockedFeatureMessage } from '../src/services/subscriptions/feature-gates';
import { FREE_REMINDER_LIMIT } from '../src/services/subscriptions/subscription-types';
import { useRemindersStore } from '../src/stores/reminders-store';
import { useSubscriptionStore } from '../src/stores/subscription-store';
import { useAppTheme } from '../src/theme/app-theme';

function getSupportTone(support: ReminderNotificationSupport) {
  if (!support.available) {
    return 'lavender' as const;
  }

  if (support.permissionStatus === 'granted') {
    return 'mint' as const;
  }

  if (support.permissionStatus === 'denied') {
    return 'coral' as const;
  }

  return 'cream' as const;
}

function getSupportTitle(support: ReminderNotificationSupport) {
  if (!support.available) {
    return 'Lembretes salvos localmente';
  }

  if (support.permissionStatus === 'granted') {
    return 'Notificações locais prontas';
  }

  if (support.permissionStatus === 'denied') {
    return 'Permissão de notificação pausada';
  }

  return 'Ative as notificações quando quiser';
}

function createDraftFromReminder(reminder: GlucoseReminder): ReminderDraft {
  return {
    time: reminder.time,
    days: reminder.days,
    context: reminder.context,
    message: reminder.message,
    enabled: reminder.enabled,
  };
}

export default function RemindersScreen() {
  const { colors: themeColors } = useAppTheme();
  const reminders = useRemindersStore((state) => state.reminders);
  const hasHydrated = useRemindersStore((state) => state.hasHydrated);
  const hydrationError = useRemindersStore((state) => state.hydrationError);
  const notificationSupport = useRemindersStore((state) => state.notificationSupport);
  const refreshNotificationSupport = useRemindersStore((state) => state.refreshNotificationSupport);
  const requestNotificationPermission = useRemindersStore((state) => state.requestNotificationPermission);
  const addReminder = useRemindersStore((state) => state.addReminder);
  const updateReminder = useRemindersStore((state) => state.updateReminder);
  const toggleReminder = useRemindersStore((state) => state.toggleReminder);
  const deleteReminder = useRemindersStore((state) => state.deleteReminder);
  const canCreateUnlimitedReminders = useSubscriptionStore((state) => state.gates.canCreateUnlimitedReminders);

  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReminderDraft>(() => createDefaultReminderDraft());
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPermissionLoading, setIsPermissionLoading] = useState(false);

  useEffect(() => {
    void refreshNotificationSupport();
  }, [refreshNotificationSupport]);

  const activeRemindersCount = useMemo(
    () => reminders.filter((reminder) => reminder.enabled).length,
    [reminders]
  );

  const supportTone = getSupportTone(notificationSupport);
  const supportTitle = getSupportTitle(notificationSupport);

  function openCreateReminder() {
    if (!canCreateUnlimitedReminders && reminders.length >= FREE_REMINDER_LIMIT) {
      setFeedbackMessage(getLockedFeatureMessage('canCreateUnlimitedReminders'));
      return;
    }

    setEditingReminderId(null);
    setDraft(createDefaultReminderDraft());
    setFormError(null);
    setIsEditorVisible(true);
  }

  function openEditReminder(reminder: GlucoseReminder) {
    setEditingReminderId(reminder.id);
    setDraft(createDraftFromReminder(reminder));
    setFormError(null);
    setIsEditorVisible(true);
  }

  function closeEditor() {
    if (isSaving) {
      return;
    }

    setIsEditorVisible(false);
    setEditingReminderId(null);
    setFormError(null);
  }

  function toggleDraftDay(day: ReminderWeekday) {
    setDraft((currentDraft) => {
      const nextDays = currentDraft.days.includes(day)
        ? currentDraft.days.filter((currentDay) => currentDay !== day)
        : [...currentDraft.days, day];

      return {
        ...currentDraft,
        days: nextDays,
      };
    });
  }

  async function handleSaveReminder() {
    const validationError = validateReminderDraft(draft);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const result = editingReminderId ? await updateReminder(editingReminderId, draft) : await addReminder(draft);

      if (!result) {
        setFormError('Não encontramos esse lembrete para atualizar.');
        return;
      }

      setFeedbackMessage(result.warning ?? 'Lembrete salvo com carinho.');
      setIsEditorVisible(false);
      setEditingReminderId(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar o lembrete agora.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleReminder(reminder: GlucoseReminder, enabled: boolean) {
    const result = await toggleReminder(reminder.id, enabled);

    if (result?.warning) {
      setFeedbackMessage(result.warning);
    }
  }

  function handleDeleteReminder(reminder: GlucoseReminder) {
    Alert.alert(
      'Excluir lembrete',
      `Remover o lembrete de ${reminder.time}? As notificações ligadas a ele também serão canceladas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void deleteReminder(reminder.id);
          },
        },
      ]
    );
  }

  async function handleRequestPermission() {
    setIsPermissionLoading(true);

    try {
      const support = await requestNotificationPermission();
      setFeedbackMessage(support.message);
    } finally {
      setIsPermissionLoading(false);
    }
  }

  return (
    <>
      <AppScreen>
        <ScreenHeader
          title="Lembretes"
          subtitle="Monte check-ins gentis para não deixar suas medições passarem batido."
          eyebrow="Rotina"
          action={<AppButton title="Novo" size="sm" fullWidth={false} onPress={openCreateReminder} />}
        />

        <AppCard tone="mint">
          <View style={{ flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' }}>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <AppText variant="subtitle">{activeRemindersCount} lembrete(s) ativo(s)</AppText>
              <AppText variant="caption" tone="muted">
                {reminders.length
                  ? 'Você pode pausar, editar ou excluir quando a sua rotina mudar.'
                  : 'Crie o primeiro horário e deixe o app te acompanhar com leveza.'}
              </AppText>
            </View>
            <Image source={appMascot.encouraging} style={{ height: 52, resizeMode: 'contain', width: 52 }} />
            <StatusBadge label={reminders.length ? `${reminders.length} salvos` : 'Novo ciclo'} tone="mint" />
          </View>
        </AppCard>

        {!canCreateUnlimitedReminders ? (
          <AppCard tone="lavender">
            <AppText variant="subtitle">Plano gratuito</AppText>
            <AppText variant="body" tone="muted">
              Você pode criar até {FREE_REMINDER_LIMIT} lembretes no plano gratuito. Lembretes existentes continuam acessíveis.
            </AppText>
          </AppCard>
        ) : null}

        <AppCard tone={supportTone}>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="subtitle">{supportTitle}</AppText>
            <AppText variant="body" tone="muted">
              {notificationSupport.message ??
                'Quando a permissão estiver liberada, o app agenda notificações locais para cada dia selecionado.'}
            </AppText>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <StatusBadge
              label={
                notificationSupport.permissionStatus === 'granted'
                  ? 'Permissão ativa'
                  : notificationSupport.permissionStatus === 'denied'
                    ? 'Permissão negada'
                    : notificationSupport.permissionStatus === 'unavailable'
                      ? 'Integração indisponível'
                      : 'Permissão pendente'
              }
              tone={
                notificationSupport.permissionStatus === 'granted'
                  ? 'success'
                  : notificationSupport.permissionStatus === 'denied'
                    ? 'danger'
                    : 'lavender'
              }
            />

            <AppButton
              title="Permitir notificações"
              variant="secondary"
              size="sm"
              fullWidth={false}
              onPress={() => {
                void handleRequestPermission();
              }}
              loading={isPermissionLoading}
              disabled={!notificationSupport.available}
            />
          </View>
        </AppCard>

        {feedbackMessage ? (
          <AppCard tone="cream">
            <AppText variant="caption" tone="muted">
              {feedbackMessage}
            </AppText>
          </AppCard>
        ) : null}

        {hydrationError ? (
          <AppCard tone="coral">
            <AppText variant="caption">{hydrationError}</AppText>
          </AppCard>
        ) : null}

        {!hasHydrated ? (
          <AppCard>
            <AppText variant="subtitle">Carregando seus lembretes...</AppText>
            <AppText variant="caption" tone="muted">
              Estamos restaurando seus horários salvos localmente.
            </AppText>
          </AppCard>
        ) : reminders.length ? (
          <View style={{ gap: spacing.md }}>
            {reminders.map((reminder) => (
              <AppCard key={reminder.id} tone={reminder.enabled ? 'white' : 'cream'}>
                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, gap: spacing.xs }}>
                    <AppText variant="title">{reminder.time}</AppText>
                    <AppText variant="caption" tone="muted">
                      {formatReminderDays(reminder.days)} • {reminder.context}
                    </AppText>
                  </View>
                  <StatusBadge
                    label={reminder.enabled ? 'Ativo' : 'Pausado'}
                    tone={reminder.enabled ? 'success' : 'neutral'}
                  />
                </View>

                <AppText variant="body">{reminder.message}</AppText>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {reminder.days.map((day) => {
                    const option = reminderWeekdayOptions.find((weekdayOption) => weekdayOption.key === day);

                    return <AppChip key={`${reminder.id}-${day}`} label={option?.label ?? day} selected disabled />;
                  })}
                </View>

                <View
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    gap: spacing.md,
                  }}
                >
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, flex: 1 }}>
                    <AppButton
                      title="Editar"
                      variant="secondary"
                      size="sm"
                      fullWidth={false}
                      onPress={() => openEditReminder(reminder)}
                    />
                    <AppButton
                      title="Excluir"
                      variant="ghost"
                      size="sm"
                      fullWidth={false}
                      onPress={() => handleDeleteReminder(reminder)}
                    />
                  </View>

                  <View style={{ alignItems: 'center', flexDirection: 'row', gap: spacing.sm }}>
                    <AppText variant="caption" tone="muted">
                      {reminder.enabled ? 'Ligado' : 'Pausado'}
                    </AppText>
                    <Switch
                      accessibilityLabel={`Ativar lembrete de ${reminder.time}`}
                      onValueChange={(value) => {
                        void handleToggleReminder(reminder, value);
                      }}
                      thumbColor={colors.white}
                      trackColor={{ false: '#DDD8D2', true: colors.mint }}
                      value={reminder.enabled}
                    />
                  </View>
                </View>
              </AppCard>
            ))}
          </View>
        ) : (
          <EmptyState
            title="Seus lembretes começam aqui"
            message="Escolha horários e dias da semana para deixar o registro de glicose mais fácil de manter."
            action={{ title: 'Criar lembrete', onPress: openCreateReminder }}
          />
        )}
      </AppScreen>

      <Modal animationType="slide" onRequestClose={closeEditor} transparent visible={isEditorVisible}>
        <Pressable
          accessibilityRole="button"
          onPress={closeEditor}
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: themeColors.overlay,
          }}
        >
          <Pressable
            accessibilityViewIsModal
            onPress={(event) => {
              event.stopPropagation();
            }}
            style={{
              backgroundColor: themeColors.groupedBackground,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              maxHeight: '90%',
              paddingHorizontal: spacing.screen,
              paddingTop: spacing.screen,
            }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xxxxl }}
            >
              <View style={{ gap: spacing.xs }}>
                <AppText variant="title">{editingReminderId ? 'Editar lembrete' : 'Novo lembrete'}</AppText>
                <AppText variant="body" tone="muted">
                  Escolha um horário tranquilo e os dias em que você quer receber esse check-in.
                </AppText>
              </View>

              <AppInput
                autoCapitalize="none"
                autoCorrect={false}
                helperText="Use o formato HH:MM, como 07:30 ou 21:15."
                keyboardType="numbers-and-punctuation"
                label="Horário"
                maxLength={5}
                onChangeText={(value) => {
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    time: value,
                  }));
                }}
                placeholder="07:30"
                value={draft.time}
              />

              <View style={{ gap: spacing.sm }}>
                <AppText variant="label">Dias da semana</AppText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {reminderWeekdayOptions.map((option) => (
                    <AppChip
                      key={option.key}
                      label={option.label}
                      onPress={() => toggleDraftDay(option.key)}
                      selected={draft.days.includes(option.key)}
                    />
                  ))}
                </View>
              </View>

              <View style={{ gap: spacing.sm }}>
                <AppText variant="label">Contexto</AppText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {reminderContexts.map((context) => (
                    <AppChip
                      key={context}
                      label={context}
                      onPress={() => {
                        setDraft((currentDraft) => ({
                          ...currentDraft,
                          context,
                        }));
                      }}
                      selected={draft.context === context}
                    />
                  ))}
                </View>
              </View>

              <View style={{ gap: spacing.sm }}>
                <AppText variant="label">Mensagem</AppText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {reminderMessageSuggestions.map((message) => (
                    <AppChip
                      key={message}
                      label={message}
                      onPress={() => {
                        setDraft((currentDraft) => ({
                          ...currentDraft,
                          message,
                        }));
                      }}
                      selected={draft.message === message}
                    />
                  ))}
                </View>
                <AppInput
                  label="Texto do lembrete"
                  multiline
                  onChangeText={(value) => {
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      message: value,
                    }));
                  }}
                  placeholder="Escreva um lembrete do seu jeito."
                  style={{ minHeight: 72, textAlignVertical: 'top' }}
                  value={draft.message}
                />
              </View>

              <AppCard tone="white">
                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
                  <View style={{ flex: 1, gap: spacing.xs }}>
                    <AppText variant="subtitle">Ativar ao salvar</AppText>
                    <AppText variant="caption" tone="muted">
                      Se a permissão estiver liberada, o app recria as notificações automaticamente.
                    </AppText>
                  </View>
                  <Switch
                    accessibilityLabel="Ativar lembrete ao salvar"
                    onValueChange={(value) => {
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        enabled: value,
                      }));
                    }}
                    thumbColor={colors.white}
                    trackColor={{ false: '#DDD8D2', true: colors.mint }}
                    value={draft.enabled}
                  />
                </View>
              </AppCard>

              {formError ? (
                <AppCard tone="coral">
                  <AppText variant="caption">{formError}</AppText>
                </AppCard>
              ) : null}

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <AppButton title="Cancelar" variant="secondary" onPress={closeEditor} style={{ flex: 1 }} />
                <AppButton
                  title={editingReminderId ? 'Salvar alterações' : 'Criar lembrete'}
                  onPress={() => {
                    void handleSaveReminder();
                  }}
                  loading={isSaving}
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

