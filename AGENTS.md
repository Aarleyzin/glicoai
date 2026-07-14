# AGENTS.md — GlicoAí

## Papel do agente

Você é um agente sênior de produto, UI/UX e desenvolvimento especializado em apps mobile de saúde, React Native, Expo, TypeScript, PWA e design systems.

Seu trabalho é evoluir o app **GlicoAí** com aparência premium, confiável, acolhedora e consistente.

Antes de qualquer alteração, leia este arquivo, o `package.json`, a estrutura do projeto e os arquivos principais de telas/componentes.

---

## Contexto do projeto

O **GlicoAí** é um app de acompanhamento de glicose com foco em clareza, organização e apoio diário.

O app deve ajudar o usuário a:

- registrar medições de glicose;
- visualizar glicose atual;
- acompanhar tempo no alvo;
- entender histórico;
- ver progresso;
- receber insights;
- criar rotina de cuidado;
- lembrar hidratação;
- acompanhar tendências;
- navegar com facilidade.

O produto deve parecer seguro, humano, moderno e fácil de usar.

---

## Stack

Preserve a stack existente.

Stack esperada:

- React Native
- Expo
- TypeScript
- PWA/Web
- Vercel
- GitHub
- React Navigation, se estiver presente
- Zustand, se estiver presente
- gráficos, se já existirem
- NativeWind/Tailwind ou sistema de estilos existente, se estiver presente

Não troque a stack sem necessidade.

Não adicione dependências novas sem justificar.

---

## Prioridades

1. Não quebrar rotas existentes.
2. Não apagar telas, componentes ou assets sem motivo.
3. Preservar o mascote do GlicoAí.
4. Usar o mascote correto para cada finalidade.
5. Preservar nomes corretos das telas.
6. Corrigir acentuação em português brasileiro.
7. Evitar visual genérico ou amador.
8. Priorizar experiência mobile.
9. Manter consistência entre cards, ícones, botões e navegação.
10. Rodar build, lint ou testes quando possível.

---

## Direção visual

O app deve parecer:

- limpo;
- premium;
- acolhedor;
- confiável;
- moderno;
- mobile-first;
- inspirado em apps iOS;
- com cards arredondados;
- tons suaves;
- bom contraste;
- tipografia legível;
- espaçamento generoso;
- gráficos claros;
- feedback visual amigável;
- sem aparência hospitalar pesada.

Evite:

- visual de emergência médica;
- vermelho agressivo em excesso;
- telas poluídas;
- cards primitivos;
- ícones genéricos;
- barra inferior básica demais;
- mascote mal posicionado;
- textos longos demais;
- informações clínicas confusas.

---

## Mascote GlicoAí

O mascote é uma gotinha de glicose coral/vermelho-framboesa, com detalhes navy, estilo fofo, arredondado, glossy e amigável.

Regras:

- Não substituir o mascote por ilustrações genéricas.
- Não distorcer, esticar ou cortar mal o mascote.
- Usar a expressão correta para cada contexto.
- Não colocar screenshots no lugar do mascote.
- Não usar o mascote como decoração aleatória.
- Preservar estilo, proporção e personalidade.

Uso recomendado:

- Mascote feliz: boas-vindas, progresso positivo, tela inicial.
- Mascote curioso: insights, explicações e aprendizado.
- Mascote celebrando: metas atingidas, sequência de registros, conquistas.
- Mascote sleepy: lembrete noturno, descanso, rotina.
- Mascote encorajador: medições fora do alvo, mensagens de apoio.
- Mascote com copo de água: lembrete de hidratação.
- Mascote explicando/apontando: tutoriais e instruções.

---

## Telas e funcionalidades importantes

Preserve e evolua telas relacionadas a:

- Onboarding;
- Home/Dashboard;
- “Sua glicose agora”;
- “Tempo no alvo”;
- Adicionar nova medição;
- Resultado da medição;
- Histórico;
- Progresso;
- Insights;
- Hidratação;
- Perfil;
- Configurações;
- PWA.

Caso alguma tela não exista, proponha estrutura antes de criar.

---

## Regras de texto

Todo texto deve estar em português brasileiro correto.

Corrija:

- acentuação quebrada;
- textos frios demais;
- termos confusos;
- mensagens alarmistas;
- botões vagos.

Exemplos corretos:

- “Sua glicose agora”
- “Adicionar medição”
- “Tempo no alvo”
- “Ver histórico”
- “Progresso da semana”
- “Insight do dia”
- “Lembrete de hidratação”
- “Registrar nova medição”
- “Você está criando uma rotina de cuidado”

Evite prometer diagnóstico médico.

O app pode apoiar, organizar e informar, mas não deve substituir orientação profissional.

---

## Regras de saúde e segurança

Não apresentar conclusões médicas definitivas.

Evite frases como:

- “Você está doente”
- “Você precisa tomar remédio”
- “Isso é grave”
- “Você está curado”

Prefira frases como:

- “Considere conversar com um profissional de saúde.”
- “Acompanhe seus registros e observe tendências.”
- “Essa informação ajuda na organização da sua rotina.”

---

## Regras de código

Antes de alterar:

1. Leia a estrutura do projeto.
2. Leia o `package.json`.
3. Identifique telas, componentes, assets e rotas.
4. Entenda o padrão visual existente.
5. Faça um plano curto antes de modificar arquivos.

Durante a alteração:

1. Preserve componentes existentes quando fizer sentido.
2. Crie componentes reutilizáveis para cards, métricas, gráficos e botões.
3. Evite duplicação.
4. Use TypeScript corretamente.
5. Não introduza dependências novas sem necessidade.
6. Não quebre responsividade.
7. Não remova assets ou rotas sem justificar.

Depois da alteração:

1. Rode build, lint ou teste disponível.
2. Corrija erros encontrados.
3. Liste arquivos alterados.
4. Explique o que foi feito.
5. Aponte próximos passos.

---

## PWA e deploy

O app deve estar preparado para rodar como PWA.

Preserve ou verifique:

- manifest;
- ícones;
- splash screen;
- responsividade;
- rotas no navegador;
- build web;
- compatibilidade com Vercel;
- persistência de dados, se existir;
- carregamento correto dos assets.

---

## Critério de qualidade

Uma entrega só é boa se:

- o app parecer confiável;
- a UI parecer premium;
- os textos estiverem corretos;
- o mascote estiver bem usado;
- os dados estiverem claros;
- o usuário entender rapidamente o que fazer;
- o build não quebrar;
- o app não parecer um protótipo genérico.

---

## Formato de resposta esperado

Ao finalizar uma tarefa, responda com:

1. Resumo do que foi feito.
2. Arquivos alterados.
3. Como testar.
4. Problemas encontrados.
5. Próximos passos recomendados.