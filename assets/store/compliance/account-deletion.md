# Exclusão de conta - GlicoAí

## URL para Play Console

Use a URL pública:

```text
https://glicoai.vercel.app/account-deletion.html
```

## Caminho dentro do app

```text
Configurações > Excluir conta
```

O usuário precisa:

1. Estar autenticado.
2. Abrir a tela "Excluir conta".
3. Digitar `EXCLUIR`.
4. Confirmar a exclusão definitiva.

## Caminho fora do app

A página pública `public/account-deletion.html` permite solicitar exclusão por e-mail.

E-mail usado no HTML atual:

```text
aarleyzin@gmail.com
```

Troque antes de publicar se quiser usar um e-mail público dedicado ao app.

## Dados removidos

- Conta do usuário no Supabase Auth.
- Perfil de saúde sincronizado.
- Medições de glicose sincronizadas.
- Lembretes sincronizados.
- Relatórios sincronizados.
- Insights associados ao usuário.

## Retenção limitada

Informar que dados mínimos podem ser mantidos quando necessário para segurança, prevenção de fraude, cumprimento legal ou auditoria técnica.

## Base de política Google Play

Google Play exige caminho dentro do app e recurso web para solicitar exclusão quando o app permite criação de conta.
