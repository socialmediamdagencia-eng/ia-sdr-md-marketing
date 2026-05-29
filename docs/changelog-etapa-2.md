# Changelog - Etapa 2

## Adicionado

- Painel de status do Supabase no Dashboard.
- Checagem server-side das tabelas essenciais:
  - `organizations`
  - `companies`
  - `leads`
  - `prospecting_campaigns`
  - `activities`
- Dashboard dinamico para validar variaveis e banco em ambiente Vercel.

## Validacao esperada

- Deploy na Vercel deve ficar `Ready`.
- Dashboard deve exibir `Status Supabase` como `Conectado`.
- Cada tabela essencial deve responder com contagem de registros.
