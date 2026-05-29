# IA SDR MD Marketing

Plataforma IA SDR construida com Next.js 15, TypeScript, Tailwind CSS, Supabase e App Router.

## Regra de desenvolvimento

Este projeto e desenvolvido com deploy continuo na Vercel.

O ambiente oficial de validacao e sempre a URL de preview da Vercel. O uso local e opcional e nao deve ser necessario para aprovar etapas.

Stack permitida:

- Next.js
- TypeScript
- Tailwind CSS
- Supabase

## Etapa 1

Esta etapa entrega a fundacao do produto:

- estrutura base do projeto
- layout principal
- sidebar e topbar
- navegacao
- configuracao Supabase
- schema completo do banco
- tipagem TypeScript
- organizacao por modulos

Integracoes externas, busca real de empresas, OpenRouter, WhatsApp e Google Calendar ainda nao foram implementados.

## Fluxo oficial

```txt
GitHub branch -> Pull Request -> Vercel Preview -> validacao pela URL de preview
```

O build da Vercel usa:

```bash
npm run ci
```

Esse comando executa typecheck, lint e build.

## Scripts

```bash
npm run dev
npm run build
npm run ci
npm run start
npm run typecheck
npm run lint
```

## Estrutura

```txt
src/
  app/
  components/
  lib/
    supabase/
  modules/
    core/
    crm/
    prospecting/
    scoring/
    messaging/
    follow-up/
    calendar/
    meetings/
    dashboard/
    activities/
    settings/
  types/
supabase/
  schema.sql
docs/
  supabase-connection.md
  deploy.md
  development-flow.md
  changelog-etapa-1.md
```
