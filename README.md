# GlicoAí

Aplicativo mobile em Expo para acompanhar registros de glicose com visual pastel, acolhedor e seguro. O app organiza medições, histórico, insights, lembretes e relatórios sem substituir orientação médica.

## Estado do projeto

- Expo Router, React Native e TypeScript.
- Sistema visual global em `src/constants/`.
- Componentes reutilizáveis em `src/components/`.
- Estado local com Zustand e persistência local.
- Supabase Auth com sessão persistente em armazenamento seguro no mobile.
- Schema Supabase aplicado com RLS e policies por usuário.
- Edge Function `delete-account` preparada para exclusão real de conta.
- Relatórios PDF com `expo-print` e compartilhamento com `expo-sharing`.
- Assistente local seguro para análise de tendências, sem diagnóstico.
- Premium preparado em modo mock para futura integração com RevenueCat.

## Identidade visual

Nome oficial: **GlicoAí**.

Use sempre essa grafia. Evite grafias sem acento, com espaço ou com letras fora do padrão oficial.

Paleta oficial:

- `coral`: `#FF6B6B`
- `coralDark`: `#F24F5E`
- `mint`: `#7ADBC8`
- `lavender`: `#D7C8FF`
- `cream`: `#FFF7EF`
- `navy`: `#252B5C`
- `mutedText`: `#8386A8`
- `softBorder`: `#ECE8E2`
- `card`: `#FFFFFF`

Direção visual:

- Pastel, moderno e acolhedor.
- iOS-like, premium e simples.
- Cards arredondados, sombras suaves e espaçamento confortável.
- Tipografia limpa e hierarquia clara.
- Microcopy em português brasileiro, com acentuação correta.
- Não usar textos que pareçam diagnóstico, ajuste de medicação ou promessa de tratamento.
### Sistema visual adaptativo

- `src/theme/app-theme.ts` concentra tokens semânticos para Light e Dark Mode.
- A tipografia usa `System`: SF Pro no iOS e a fonte nativa equivalente no Android e web.
- Espaçamento segue uma grade de 8 pontos; cards principais usam raio contínuo de 20 px.
- `AppScreen`, `AppText`, `AppCard`, `AppButton`, `AppInput`, `AppChip`, `AppSection` e `AppListRow` são a base obrigatória para novas telas.
- Ações usam animação spring discreta, alvos de toque confortáveis e estados acessíveis.
- Valores de glicose usam números tabulares e hierarquia dominante; cor nunca é o único indicador de status.
- `app.json` usa `userInterfaceStyle: automatic` para acompanhar a preferência do dispositivo.
- O pós-processamento em `scripts/prepare-web-pwa.js` carrega o bundle como módulo e preserva Light/Dark Mode no shell PWA.

## Assets

Os arquivos em `assets/images/screens/` são **apenas referência visual**. Eles não devem ser renderizados dentro da interface final.

Assets renderizáveis:

- `assets/images/mascot/`: mascotes usados nas telas.
- `assets/images/brand/`: logo, splash e identidade da marca.
- `assets/icons/`: ícone do app.

Referência central dos assets existentes:

```text
src/constants/assets.ts
```

Atualize esse arquivo apenas com assets que realmente existirem no projeto.

## Uso dos mascotes

- Onboarding: `mascot-hero-welcome.png`
- Dashboard: `mascot-happy.png`
- Nova medição: `mascot-pointing.png`
- Resultado dentro do alvo: `mascot-celebrating.png`
- Resultado fora do alvo, alertas e erros: `mascot-encouraging.png`
- Histórico vazio: `mascot-curious.png`
- Insights: `mascot-pointing.png`
- Mais: `mascot-encouraging.png`
- Assistente IA: `mascot-curious.png` ou `mascot-pointing.png`
- Lembretes: `mascot-encouraging.png`
- Premium: `mascot-celebrating.png` com moderação

## Rotas

Fluxo inicial:

1. `app/index.tsx`
2. `app/splash.tsx`
3. `app/onboarding.tsx`
4. `app/login.tsx`
5. `app/register.tsx`
6. `app/forgot-password.tsx`
7. `app/auth/callback.tsx`
8. `app/health-profile-setup.tsx`
9. `app/(tabs)/_layout.tsx`

Tabs:

- `app/(tabs)/index.tsx` -> Início
- `app/(tabs)/add-measurement.tsx` -> Medir
- `app/(tabs)/history.tsx` -> Histórico
- `app/(tabs)/insights.tsx` -> Insights
- `app/(tabs)/more.tsx` -> Mais

Rotas extras:

- `app/measurement-result.tsx`
- `app/assistant.tsx`
- `app/reports.tsx`
- `app/reminders.tsx`
- `app/settings.tsx`
- `app/premium.tsx`
- `app/terms.tsx`
- `app/privacy.tsx`
- `app/delete-account.tsx`

## Supabase Auth

Variáveis em `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://kzwxgqcymgzhtgbjqvph.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_ENABLE_LOCAL_AUTH_FALLBACK=false
EXPO_PUBLIC_PREMIUM_GATES_ENABLED=false
```

Para a primeira versão gratuita, mantenha `EXPO_PUBLIC_PREMIUM_GATES_ENABLED=false`. Ative como `true` apenas quando RevenueCat/Google Play Billing estiverem configurados e testados.

Configuração aplicada no projeto Supabase:

- `Site URL`: `glicoai://auth/callback`
- Email confirmation: ligado para produção.
- Redirect URLs liberadas para app nativo, Expo Go/local e futuro domínio web:
  - `glicoai://auth/callback`
  - `glicoai:///auth/callback`
  - `exp://**/--/auth/callback`
  - `http://localhost:8081/**`
  - `http://localhost:8082/**`
  - `http://localhost:8087/**`
  - `https://glicoai.vercel.app/**`

O app usa `Linking.createURL('/auth/callback')` em cadastro e reset de senha.

## Banco Supabase

O arquivo `supabase/schema.sql` contém:

- `profiles`
- `glucose_readings`
- `reminders`
- `ai_insights`
- `reports`
- RLS ativado em todas as tabelas.
- Policies de `select`, `insert`, `update` e `delete` por `auth.uid() = user_id`.
- Índices por `user_id` e datas importantes.

Para reaplicar o schema:

```bash
npx supabase link --project-ref kzwxgqcymgzhtgbjqvph
npx supabase db query --linked --file supabase/schema.sql
```

Validação feita:

- RLS ativo nas 5 tabelas.
- 4 policies por tabela.
- Usuário autenticado conseguiu sincronizar perfil, medição, lembrete, insight e relatório.
- Usuário anônimo não recebeu dados das tabelas protegidas.

## Persistência local

- Medições, perfil, unidade, faixa alvo, lembretes, relatórios e assinatura mock são persistidos localmente.
- No mobile nativo, sessão Supabase e dados locais sensíveis passam pela camada `expo-secure-store`.
- Não limpe o storage em reload.
- Não apague dados locais ao preparar Supabase.
- Dados locais podem ser sincronizados com Supabase quando houver sessão autenticada.

## Segurança em saúde

- O GlicoAí não substitui orientação médica.
- Não diagnosticar.
- Não sugerir dose de insulina.
- Não ajustar medicação.
- Não prometer cura.
- Em valores muito altos, muito baixos ou em caso de sintomas, orientar conversa com profissional de saúde.

## Exclusão de conta

- A exclusão real usa a Edge Function `delete-account`.
- Caminho: `supabase/functions/delete-account/index.ts`.
- A função exige sessão autenticada e usa service role apenas no ambiente seguro da Supabase.
- As tabelas usam `ON DELETE CASCADE` a partir de `auth.users`, então os dados sincronizados do usuário são removidos junto com a conta.

Deploy:

```bash
npx supabase functions deploy delete-account
```

## Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
npm run typecheck
npm run doctor
npm run qa:release
npm run export:web
npm run preview:web
npm run build:web
npm run build:android
npm run submit:android
```

## Checklist Play Store

- Assets preparados:
  - `assets/store/play-store-icon-512.png`
  - `assets/store/feature-graphic-1024x500.png`
  - `assets/icons/adaptive-icon.png`
  - `assets/store/screenshots/android/README.md`
- App icon 512x512.
- Feature graphic 1024x500.
- Screenshots Android reais do build final, sem moldura falsa e sem screenshots de referência dentro da UI.
- Política de Privacidade.
- Termos de Uso.
- Página ou instrução pública de exclusão de conta.
- Data Safety.
- Health Apps declaration.
- Classificação indicativa.
- Aviso de que o app não substitui orientação médica.
- Teste fechado, se exigido.
- Build `.aab` gerado pelo EAS.

Arquivos de apoio para Play Console:

- `public/account-deletion.html`
- `public/privacy.html`
- `public/terms.html`
- `assets/store/compliance/account-deletion.md`
- `assets/store/compliance/data-safety.md`
- `assets/store/compliance/health-apps-declaration.md`

URLs temporárias de compliance na Vercel:

```text
https://glicoai.vercel.app/privacy.html
https://glicoai.vercel.app/terms.html
https://glicoai.vercel.app/account-deletion.html
```

## Validação

Antes de publicar:

```bash
npm run qa:release
npm run export:web
npm run build:android
```

Ambiente EAS production obrigatório:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_ENABLE_LOCAL_AUTH_FALLBACK=false`
- `EXPO_PUBLIC_PREMIUM_GATES_ENABLED=false` para a v1 gratuita



## Declarações obrigatórias do Google Play

As respostas preparadas para Data Safety, Health Apps, classificação indicativa e acesso de revisão estão em:

- `docs/play-store/fase-6-declaracoes-obrigatorias.md`
