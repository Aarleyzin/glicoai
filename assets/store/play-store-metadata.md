# Play Store - GlicoAí

## Nome do app

GlicoAí

## Descrição curta

Acompanhe sua glicose com leveza, clareza e organização.

## Descrição completa

GlicoAí ajuda você a registrar medições de glicose, acompanhar sua evolução e organizar informações importantes da sua rotina de cuidado.

Com uma experiência simples, acolhedora e em português brasileiro, o app permite visualizar histórico, progresso, tempo no alvo, lembretes e relatórios informativos para consulta.

Recursos principais:

- Registro manual de medições de glicose
- Histórico por período, status e contexto
- Tela de progresso com tendências e resumo recente
- Perfil de saúde com unidade e faixa alvo personalizada
- Lembretes locais para check-ins de glicose
- Relatórios informativos em PDF
- Assistente local para resumir tendências dos registros
- Exclusão de conta e dados pelo próprio app

O GlicoAí foi criado para apoiar a organização dos registros de glicose no dia a dia, sem complicar a rotina.

Aviso importante: o GlicoAí não substitui orientação médica, não diagnostica doenças, não ajusta medicação e não recomenda dose de insulina. Em caso de sintomas, valores muito altos ou baixos ou dúvidas clínicas, procure um profissional de saúde.

## Novidades desta versão

Primeira versão do GlicoAí para Android:

- Cadastro e login com Supabase
- Registro de medições de glicose
- Dashboard e progresso
- Histórico de medições
- Lembretes locais
- Relatórios informativos
- Assistente local seguro
- Perfil de saúde e configurações
- Exclusão de conta

## Categoria sugerida

Saúde e fitness

## Tags/temas úteis

- glicose
- diabetes
- saúde
- histórico de glicose
- acompanhamento de glicose
- relatório de glicose
- lembrete de glicose

## Assets preparados

- Ícone Play Store 512x512: `assets/store/play-store-icon-512.png`
- Feature graphic 1024x500: `assets/store/feature-graphic-1024x500.png`
- Adaptive icon Android: `assets/icons/adaptive-icon.png`
- Pasta de screenshots Android: `assets/store/screenshots/android/`

## Screenshots Android recomendadas

Capturar do app final instalado no Android real ou emulador. Não usar imagens de referência de `assets/images/screens/`.

Sugestão de ordem:

1. Onboarding
2. Início
3. Nova medição
4. Resultado da medição
5. Progresso
6. Histórico completo
7. Lembretes ou Relatórios
8. Mais/Configurações

## URLs públicas necessárias

- Política de Privacidade: `https://glicoai.vercel.app/privacy.html`
- Termos de Uso: `https://glicoai.vercel.app/terms.html`
- Exclusão de conta: `https://glicoai.vercel.app/account-deletion.html`

## Observação de monetização para a V1

A primeira versão deve ser publicada como gratuita.

Manter no EAS production:

```env
EXPO_PUBLIC_PREMIUM_GATES_ENABLED=false
```

Não declarar compras no Play Console enquanto Google Play Billing/RevenueCat não estiverem ativos e testados.
