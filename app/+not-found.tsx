import { Link } from 'expo-router';

import { AppButton, AppCard, AppScreen, AppText, ScreenHeader } from '../src/components';

export default function NotFoundScreen() {
  return (
    <AppScreen>
      <ScreenHeader title="Tela não encontrada" subtitle="A rota que você tentou abrir não existe nesta versão do app." />
      <AppCard>
        <AppText variant="body" tone="muted">
          Volte para a área principal para continuar navegando pelo GlicoAí.
        </AppText>
      </AppCard>
      <Link asChild href="/(tabs)">
        <AppButton title="Ir para o início" />
      </Link>
    </AppScreen>
  );
}
