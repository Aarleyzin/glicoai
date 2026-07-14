import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppListRow, AppScreen, AppSection, AppText } from '../../src/components';
import { spacing } from '../../src/constants';
import { useAppTheme } from '../../src/theme/app-theme';

type MenuItem = {
  href: string;
  title: string;
  description: string;
  icon: 'comment-dots' | 'file-alt' | 'bell' | 'crown' | 'cog' | 'shield-alt';
  accent?: 'premium';
};

const resourceItems: MenuItem[] = [
  { href: '/assistant', title: 'Assistente IA', description: 'Entenda seus registros com mais clareza.', icon: 'comment-dots' },
  { href: '/reports', title: 'Relatórios', description: 'Crie um resumo para suas consultas.', icon: 'file-alt' },
  { href: '/reminders', title: 'Lembretes', description: 'Organize sua rotina de registros.', icon: 'bell' },
  { href: '/premium', title: 'GlicoAí Premium', description: 'Conheça todos os recursos do plano.', icon: 'crown', accent: 'premium' },
];

const accountItems: MenuItem[] = [
  { href: '/settings', title: 'Configurações', description: 'Perfil, unidade, faixa alvo e conta.', icon: 'cog' },
  { href: '/privacy', title: 'Privacidade', description: 'Saiba como protegemos seus dados.', icon: 'shield-alt' },
  { href: '/terms', title: 'Termos de Uso', description: 'Consulte as condições do aplicativo.', icon: 'file-alt' },
];

function MenuSection({ title, items }: { title: string; items: MenuItem[] }) {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <AppSection title={title}>
      {items.map((item, index) => (
        <AppListRow
          key={item.href}
          title={item.title}
          subtitle={item.description}
          showSeparator={index < items.length - 1}
          onPress={() => router.push(item.href as never)}
          icon={<FontAwesome5 color={item.accent === 'premium' ? colors.warning : colors.accent} name={item.icon} size={15} solid />}
        />
      ))}
    </AppSection>
  );
}

export default function MoreScreen() {
  return (
    <AppScreen contentStyle={{ gap: spacing.xxl }}>
      <View style={{ gap: spacing.xs, paddingTop: spacing.sm }}>
        <AppText variant="caption" tone="muted" weight="semibold">GlicoAí</AppText>
        <AppText accessibilityRole="header" weight="bold" style={{ fontSize: 34, lineHeight: 41 }}>Mais</AppText>
        <AppText variant="body" tone="muted">Recursos, preferências e suporte.</AppText>
      </View>

      <MenuSection title="Recursos" items={resourceItems} />
      <MenuSection title="Conta e privacidade" items={accountItems} />
    </AppScreen>
  );
}
