import { View } from 'react-native';

import { AppCard, AppScreen, AppText, ScreenHeader } from '../src/components';
import { spacing } from '../src/constants';

const termsSections = [
  {
    title: 'Finalidade do app',
    body:
      'O GlicoAí ajuda a registrar, organizar e visualizar medições de glicose, lembretes, histórico, insights locais e relatórios informativos.',
  },
  {
    title: 'Uso responsável',
    body:
      'Você é responsável por conferir as informações registradas e por procurar orientação profissional quando tiver dúvidas clínicas, sintomas ou valores fora da sua faixa alvo.',
  },
  {
    title: 'Sem orientação médica',
    body:
      'O GlicoAí não diagnostica doenças, não prescreve tratamento, não ajusta medicação e não recomenda dose de insulina. Os dados exibidos mostram apenas tendências dos registros.',
  },
  {
    title: 'Conta e segurança',
    body:
      'Ao usar autenticação, mantenha seus dados de acesso protegidos. O app usa Supabase Auth para login, cadastro, recuperação de senha e sessão persistente.',
  },
  {
    title: 'Plano gratuito e Premium',
    body:
      'Recursos essenciais podem ser usados gratuitamente. Recursos Premium podem ser oferecidos futuramente, sempre com informações claras antes de qualquer compra.',
  },
  {
    title: 'Relatórios e compartilhamento',
    body:
      'Relatórios são apenas informativos e podem ser compartilhados por você com profissionais de saúde. Eles não substituem avaliação clínica.',
  },
  {
    title: 'Exclusão de conta',
    body:
      'Você pode solicitar a exclusão da conta no app. Ao confirmar a exclusão, os dados sincronizados associados ao usuário são removidos conforme a política de privacidade.',
  },
];

export default function TermsScreen() {
  return (
    <AppScreen>
      <ScreenHeader
        title="Termos de Uso"
        subtitle="Condições para usar o GlicoAí com segurança."
        eyebrow="Jurídico"
      />

      <AppCard tone="lavender">
        <AppText variant="subtitle">Uso simples e seguro</AppText>
        <AppText variant="body" tone="muted">
          Ao usar o GlicoAí, você concorda em utilizar o app como ferramenta de organização pessoal dos seus registros de glicose.
        </AppText>
      </AppCard>

      <View style={{ gap: spacing.md }}>
        {termsSections.map((section) => (
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
          Última revisão: 10/05/2026. Antes da publicação, informe também uma URL pública destes termos na Play Store.
        </AppText>
      </AppCard>
    </AppScreen>
  );
}
