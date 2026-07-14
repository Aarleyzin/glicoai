# Fase 6 - Declarações obrigatórias do Google Play

Documento preparado a partir do comportamento atual do GlicoAí. Revise novamente se forem adicionados SDKs de analytics, publicidade, crash reporting, pagamentos, Health Connect ou novos provedores de dados.

## 1. Data Safety

### Coleta e segurança

- O app coleta ou transmite dados do usuário: **Sim**.
- Os dados são criptografados em trânsito: **Sim (HTTPS/TLS)**.
- O usuário pode solicitar exclusão dos dados: **Sim**.
- Exclusão dentro do app: **Configurações > Excluir conta**.
- URL pública de exclusão: `https://glicoai.vercel.app/account-deletion.html`.
- O app compartilha dados com terceiros para publicidade: **Não**.
- O app vende dados pessoais ou de saúde: **Não**.

O Supabase atua como provedor de serviço para autenticação e sincronização. O compartilhamento de um PDF acontece somente quando o próprio usuário aciona o compartilhamento.

### Tipos de dados a declarar

| Categoria do Play Console | Tipo | Coletado | Compartilhado | Obrigatoriedade | Finalidades |
| --- | --- | --- | --- | --- | --- |
| Informações pessoais | Nome | Sim | Não | Obrigatório no perfil inicial | Funcionalidade do app; gerenciamento da conta |
| Informações pessoais | Endereço de e-mail | Sim | Não | Obrigatório | Funcionalidade do app; gerenciamento da conta |
| Informações pessoais | IDs de usuário | Sim | Não | Obrigatório | Funcionalidade do app; gerenciamento da conta; segurança e prevenção de fraude |
| Informações pessoais | Outras informações | Sim | Não | Opcional | Funcionalidade do app; gerenciamento da conta |
| Saúde e fitness | Informações de saúde | Sim | Não | Obrigatório no perfil inicial | Funcionalidade do app; personalização |
| Atividade no app | Outro conteúdo gerado pelo usuário | Sim | Não | Opcional | Funcionalidade do app |

Detalhamento:

- **Outras informações pessoais:** data de nascimento opcional.
- **Informações de saúde obrigatórias no perfil:** tipo de acompanhamento, unidade de medida, faixa-alvo, uso de insulina e uso de medicação. As opções “Prefiro não informar” permanecem disponíveis quando aplicável.
- **Informações de saúde opcionais:** medições de glicose, data e hora, contexto, humor ou sintomas e observações.
- **Outro conteúdo gerado pelo usuário:** observações livres, configuração de lembretes e metadados de relatórios sincronizados.

### Não selecionar na versão atual

- Localização aproximada ou precisa.
- Telefone, endereço residencial, contatos ou calendário.
- Fotos, vídeos, áudio, câmera ou microfone.
- Dados financeiros ou histórico de compras.
- Mensagens, SMS ou e-mails do usuário.
- Histórico de navegação ou pesquisa.
- Apps instalados.
- Identificadores de publicidade.
- Analytics, diagnósticos ou crash logs, enquanto nenhum SDK correspondente estiver no build publicado.

## 2. Health Apps declaration

Selecionar:

- **Medical > Diseases and Conditions Management** (Gerenciamento de doenças e condições).

Não selecionar na versão atual:

- Medical Device Apps.
- Clinical Decision Support.
- Medication and Treatment Management.
- Health Connect.
- Pesquisa com seres humanos.
- Vínculo governamental ou com organização de saúde.

### Descrição pronta

> O GlicoAí permite que o usuário registre manualmente medições de glicose, acompanhe histórico e tendências, configure lembretes e gere relatórios informativos. O app organiza registros pessoais e não se conecta a medidores, sensores ou outros dispositivos médicos. O GlicoAí não é um dispositivo médico, não diagnostica, não trata, não cura e não previne condições médicas. O app não recomenda dose de insulina nem ajuste de medicação e não substitui orientação médica. Para aconselhamento, diagnóstico ou tratamento, o usuário deve consultar um profissional de saúde qualificado.

## 3. Classificação indicativa (IARC)

Categoria recomendada: **Aplicativo / utilitário de saúde**.

Responder conforme o conteúdo atual:

- Violência: **Não**.
- Conteúdo sexual ou nudez: **Não**.
- Linguagem imprópria: **Não**.
- Drogas controladas, tabaco ou álcool: **Não**.
- Jogos de azar: **Não**.
- Compras de produtos controlados: **Não**.
- Conteúdo gerado por usuários publicado para outras pessoas: **Não**.
- Compartilhamento público de localização: **Não**.
- Interação irrestrita entre usuários: **Não**.
- Anúncios: **Não**, enquanto nenhum SDK de anúncios estiver no build.
- Compras digitais: **Não** na primeira versão gratuita. Atualizar para **Sim** quando a assinatura Premium estiver realmente ativa.

O Play Console/IARC calcula a classificação final. Não informar manualmente uma faixa etária diferente do resultado emitido.

## 4. Acesso do app para revisão

Como o conteúdo principal exige login, marcar que **parte ou toda a funcionalidade é restrita** e fornecer uma conta exclusiva de revisão.

### Campos para preencher no Play Console

- Nome da instrução: `Google Play review access`.
- Usuário/e-mail: `[EMAIL_EXCLUSIVO_DE_REVISAO]`.
- Senha: `[SENHA_ESTAVEL_DE_REVISAO]`.
- Outros dados: `No OTP or two-factor authentication is required.`

### Instruções em inglês

> Open the app and tap “Entrar”. Use the review email and password provided above. The account has a confirmed email, does not require OTP or two-factor authentication, and is available from any location. After signing in, the reviewer can access Home, add a glucose record, view Progress and full History, create reminders, generate the report preview, open the local assistant, review Settings, Privacy Policy, Terms of Use, and the in-app account deletion flow. All essential features are available without a paid subscription in this release.

Requisitos da conta de revisão:

- e-mail confirmado;
- credenciais reutilizáveis e sem expiração curta;
- sem OTP, 2FA, CAPTCHA ou bloqueio por localização;
- sem dados médicos reais;
- manter ativa durante todo o processo de revisão;
- testar as credenciais no AAB de produção antes do envio.

Não salvar a senha da conta de revisão neste repositório. Ela deve ser informada somente no campo protegido do Play Console.

## 5. Declaração pública obrigatória

Usar na descrição completa da loja e manter dentro do app:

> O GlicoAí acompanha e organiza registros de glicose informados pelo usuário. O app não é um dispositivo médico e não diagnostica, trata, cura ou previne qualquer condição médica. Não recomenda dose de insulina nem ajuste de medicação e não substitui orientação médica. Consulte um profissional de saúde para aconselhamento, diagnóstico ou tratamento.

## 6. Conferência antes de enviar

- Política pública: `https://glicoai.vercel.app/privacy.html`.
- Termos públicos: `https://glicoai.vercel.app/terms.html`.
- Exclusão de conta: `https://glicoai.vercel.app/account-deletion.html`.
- Confirmar que as três URLs abrem sem login e sem redirecionamento quebrado.
- Confirmar que o AAB não contém SDK de anúncios, analytics ou pagamentos não declarados.
- Confirmar que a conta de revisão funciona no build de produção.
- Salvar capturas das declarações enviadas e do certificado IARC.

## 7. Referências oficiais

- Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Health Apps declaration: https://support.google.com/googleplay/android-developer/answer/14738291
- Health Content and Services: https://support.google.com/googleplay/android-developer/answer/16679511
- Classificação indicativa: https://support.google.com/googleplay/android-developer/answer/9898843
- Acesso para revisão: https://support.google.com/googleplay/android-developer/answer/15748846
- Exclusão de conta: https://support.google.com/googleplay/android-developer/answer/13327111
