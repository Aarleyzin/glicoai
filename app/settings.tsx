import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, View } from 'react-native';

import { AppButton, AppCard, AppChip, AppListRow, AppScreen, AppSection, AppText, ScreenHeader } from '../src/components';
import { spacing } from '../src/constants';
import { formatTargetRangeLabel } from '../src/features/glucose/glucose-presenters';
import { useAppSession } from '../src/providers/app-session-provider';
import { useAppSettingsStore } from '../src/stores/app-settings-store';
import { useGlucoseStore } from '../src/stores/glucose-store';
import { useAppTheme } from '../src/theme/app-theme';

type SettingsItem = {
  href?: string;
  title: string;
  subtitle: string;
  icon: 'user' | 'ruler' | 'sliders-h' | 'bell' | 'file-export' | 'shield-alt' | 'file-alt' | 'trash-alt';
  onPress?: () => void;
  destructive?: boolean;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { authMessage, authMode, clearAuthMessage, isSupabaseConfigured, session, signOut } = useAppSession();
  const healthProfile = useAppSettingsStore((state) => state.healthProfile);
  const unitPreference = useAppSettingsStore((state) => state.unitPreference);
  const targetRange = useAppSettingsStore((state) => state.targetRange);
  const reminderPreferences = useAppSettingsStore((state) => state.reminderPreferences);
  const setReminderPreferences = useAppSettingsStore((state) => state.setReminderPreferences);
  const settingsHydrationError = useAppSettingsStore((state) => state.hydrationError);
  const readingsHydrationError = useGlucoseStore((state) => state.hydrationError);

  const items: SettingsItem[] = [
    { href: '/health-profile-setup', title: 'Perfil de saúde', subtitle: 'Dados básicos e tipo de acompanhamento.', icon: 'user' },
    { href: '/health-profile-setup', title: 'Unidade de medida', subtitle: `Exibição atual em ${unitPreference}.`, icon: 'ruler' },
    { href: '/health-profile-setup', title: 'Faixa alvo', subtitle: formatTargetRangeLabel(targetRange.min, targetRange.max, unitPreference), icon: 'sliders-h' },
    { href: '/reminders', title: 'Notificações', subtitle: 'Lembretes e permissões locais.', icon: 'bell' },
    { title: 'Exportar dados', subtitle: 'Prepare uma cópia organizada dos registros.', icon: 'file-export', onPress: () => Alert.alert('Exportação', 'Use Relatórios para gerar e compartilhar um PDF com seus registros.') },
    { href: '/privacy', title: 'Política de Privacidade', subtitle: 'Como seus dados são tratados.', icon: 'shield-alt' },
    { href: '/terms', title: 'Termos de Uso', subtitle: 'Condições de utilização do app.', icon: 'file-alt' },
    { href: '/delete-account', title: 'Excluir conta', subtitle: 'Remoção definitiva e protegida.', icon: 'trash-alt', destructive: true },
  ];

  const error = settingsHydrationError || readingsHydrationError;

  return (
    <AppScreen>
      <ScreenHeader title="Configurações" subtitle="Personalize o GlicoAí para a sua rotina." eyebrow="Preferências" />

      <AppCard style={{ gap: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="title" weight="bold">{healthProfile.name || 'Seu perfil'}</AppText>
          <AppText variant="body" tone="muted">Faixa alvo e preferências usadas nos seus resumos.</AppText>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <AppChip label={unitPreference} selected />
          <AppChip label={formatTargetRangeLabel(targetRange.min, targetRange.max, unitPreference)} />
          <AppChip label={isSupabaseConfigured && session ? 'Conta conectada' : 'Conta desconectada'} />
        </View>
      </AppCard>

      {error ? (
        <AppCard tone="coral"><AppText variant="body" tone="danger">{error}</AppText></AppCard>
      ) : null}

      <AppSection title="Lembretes" footer="As notificações são locais e podem ser alteradas a qualquer momento.">
        <AppListRow
          title="Permitir lembretes"
          subtitle={reminderPreferences.notificationsEnabled ? 'Ativados neste dispositivo' : 'Desativados neste dispositivo'}
          icon={<FontAwesome5 color={colors.accent} name="bell" size={15} solid />}
          trailing={
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              <AppChip label={reminderPreferences.notificationsEnabled ? 'Ativado' : 'Desativado'} selected={reminderPreferences.notificationsEnabled} onPress={() => setReminderPreferences({ notificationsEnabled: !reminderPreferences.notificationsEnabled })} />
            </View>
          }
        />
      </AppSection>

      <AppSection title="Ajustes e conta" footer="O GlicoAí organiza registros e não substitui orientação médica.">
        {items.map((item, index) => (
          <AppListRow
            key={`${item.title}-${index}`}
            title={item.title}
            subtitle={item.subtitle}
            destructive={item.destructive}
            showSeparator={index < items.length - 1}
            onPress={() => item.href ? router.push(item.href as never) : item.onPress?.()}
            icon={<FontAwesome5 color={item.destructive ? colors.danger : colors.accent} name={item.icon} size={15} solid />}
          />
        ))}
      </AppSection>

      {!isSupabaseConfigured ? (
        <AppCard><AppText variant="caption" tone="muted">Serviço de conta indisponível neste ambiente. Seus dados locais permanecem preservados.</AppText></AppCard>
      ) : null}

      <AppButton title="Sair da conta" variant="secondary" onPress={async () => { clearAuthMessage(); await signOut(); router.replace('/login'); }} />

      {authMessage && authMode === 'local-fallback' ? <AppText align="center" variant="caption" tone="muted">{authMessage}</AppText> : null}
    </AppScreen>
  );
}
