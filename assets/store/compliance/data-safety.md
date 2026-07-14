# Data Safety - respostas sugeridas para Google Play

> Guia operacional para preencher o formulário Data Safety. A responsabilidade final pela declaração é do titular da conta Play Console.

## Coleta e segurança

### O app coleta ou compartilha dados de usuário?

Resposta sugerida: **Sim, coleta dados.**

Motivo: quando o usuário cria conta ou sincroniza dados, informações saem do dispositivo e são armazenadas no Supabase.

### Todos os dados coletados são criptografados em trânsito?

Resposta sugerida: **Sim.**

Motivo: as conexões com Supabase usam HTTPS/TLS.

### O usuário pode solicitar exclusão dos dados?

Resposta sugerida: **Sim.**

Caminhos:

- Dentro do app: `Configurações > Excluir conta`.
- Web: `https://glicoai.vercel.app/account-deletion.html`.

## Dados coletados

### Personal info

#### Name

- Coletado: **Sim**
- Compartilhado: **Não**, exceto prestadores de serviço que processam dados em nome do app.
- Obrigatório: **Opcional**
- Finalidade: **App functionality**, **Account management**
- Observação: nome informado no perfil de saúde.

#### Email address

- Coletado: **Sim**
- Compartilhado: **Não**, exceto prestadores de serviço.
- Obrigatório: **Obrigatório para conta**
- Finalidade: **App functionality**, **Account management**, **Fraud prevention, security, and compliance**
- Observação: usado para login, cadastro e recuperação de senha.

#### User IDs

- Coletado: **Sim**
- Compartilhado: **Não**, exceto prestadores de serviço.
- Obrigatório: **Obrigatório para conta**
- Finalidade: **App functionality**, **Account management**, **Fraud prevention, security, and compliance**
- Observação: identificador Supabase do usuário.

#### Other info

- Coletado: **Sim**
- Compartilhado: **Não**, exceto prestadores de serviço.
- Obrigatório: **Opcional**
- Finalidade: **App functionality**
- Observação: data de nascimento e tipo de acompanhamento, se preenchidos.

### Health and fitness

#### Health info

- Coletado: **Sim**
- Compartilhado: **Não**, exceto prestadores de serviço.
- Obrigatório: **Opcional**, mas necessário para os principais recursos de acompanhamento.
- Finalidade: **App functionality**, **Personalization**
- Dados: medições de glicose, unidade, faixa alvo, contexto da medição, sentimento, observações, perfil de saúde, uso de insulina/medicação quando informado.

### App activity

#### Other user-generated content

- Coletado: **Sim**
- Compartilhado: **Não**, exceto prestadores de serviço.
- Obrigatório: **Opcional**
- Finalidade: **App functionality**
- Dados: observações escritas pelo usuário, mensagens de lembretes e conteúdo de relatórios gerados.

### Files and docs

Resposta sugerida: **Não coletado** na V1, se os PDFs continuarem locais e forem compartilhados apenas por ação do usuário.

Atualizar para **Sim** se no futuro relatórios forem enviados para storage/cloud.

### Device or other IDs

Resposta sugerida: **Não coletado** na V1, se não houver analytics, ads, push remoto ou SDK que capture identificadores.

### App info and performance

Resposta sugerida: **Não coletado** na V1, se não houver crash analytics ou telemetria externa.

## Compartilhamento

Resposta sugerida: **Não compartilha dados com terceiros para fins próprios.**

Justificativa: Supabase atua como prestador de serviço/processador. Compartilhamento de relatório PDF acontece por ação do usuário quando ele escolhe compartilhar.

## Venda de dados

Resposta sugerida: **Não vende dados.**

## Dados opcionais vs obrigatórios

- Conta: e-mail e senha são necessários para login/sincronização.
- Dados de saúde: preenchidos pelo usuário e necessários para acompanhamento.
- Perfil detalhado: opcional.

## Pontos que exigem atualização futura

Atualizar este formulário se adicionar:

- IA externa com envio de registros.
- Analytics.
- Crash reporting.
- Push remoto.
- Compras reais/RevenueCat.
- Storage cloud para PDFs.
- Integração com Health Connect.
