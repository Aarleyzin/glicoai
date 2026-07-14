import { View } from 'react-native';

import { AppCard, AppScreen, AppText, ScreenHeader } from '../src/components';
import { spacing } from '../src/constants';

const privacySections = [
  {
    title: 'Quais dados o app usa',
    body:
      'O GlicoAí pode armazenar dados informados por você, como nome, perfil de saúde, unidade preferida, faixa alvo, medições de glicose, contexto da medição, lembretes e relatórios gerados.',
  },
  {
    title: 'Como os dados são armazenados',
    body:
      'Os dados podem ficar salvos localmente no seu dispositivo e, quando você entra com uma conta, podem ser sincronizados com Supabase para manter seus registros associados ao seu usuário.',
  },
  {
    title: 'Dados de saúde',
    body:
      'As informações registradas no app são usadas para organização pessoal, histórico, relatórios e visualização de tendências. O GlicoAí não vende dados de saúde e não usa esses dados para diagnóstico.',
  },
  {
    title: 'Notificações',
    body:
      'Se você ativar lembretes, o app pode solicitar permissão para enviar notificações locais. Você pode alterar essa permissão nas configurações do dispositivo.',
  },
  {
    title: 'Relatórios',
    body:
      'Relatórios são gerados a partir dos dados locais ou sincronizados da sua conta. O compartilhamento acontece somente quando você escolhe compartilhar o arquivo.',
  },
  {
    title: 'Exclusão de conta',
    body:
      'Você pode solicitar a exclusão da conta dentro do app. Quando a exclusão é concluída, os dados sincronizados associados ao usuário são removidos do Supabase conforme as regras de segurança configuradas.',
  },
  {
    title: 'Aviso importante',
    body:
      'O GlicoAí não substitui orientação médica. Em caso de sintomas, valores muito altos ou baixos, dúvidas clínicas ou ajuste de tratamento, procure um profissional de saúde.',
  },
];

export default function PrivacyScreen() {
  return (
    <AppScreen>
      <ScreenHeader
        title="Política de Privacidade"
        subtitle="Entenda como seus dados são tratados no GlicoAí."
        eyebrow="Privacidade"
      />

      <AppCard tone="lavender">
        <AppText variant="subtitle">Privacidade em primeiro lugar</AppText>
        <AppText variant="body" tone="muted">
          O GlicoAí foi criado para ajudar você a organizar registros de glicose com clareza, segurança e controle.
        </AppText>
      </AppCard>

      <View style={{ gap: spacing.md }}>
        {privacySections.map((section) => (
          <AppCard key={section.title}>
            <AppText variant="subtitle">{section.title}</AppText>
            <AppText variant="body" tone="muted">
              {section.body}
            </AppText>
          </AppCard>
        ))}
      </View>

      <AppCard tone="cream">
        <AppText variant="caption" tone="muted">
          Última revisão: 10/05/2026. Antes da publicação, informe também uma URL pública desta política na Play Store.
        </AppText>
      </AppCard>
    </AppScreen>
  );
}
