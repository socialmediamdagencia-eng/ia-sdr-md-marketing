# Changelog - Etapa 1

## Adicionado

- Projeto Next.js 15 com TypeScript e App Router.
- Tailwind CSS configurado.
- Layout principal com sidebar, topbar e navegacao mobile.
- Rotas iniciais:
  - `/`
  - `/prospeccao`
  - `/leads`
  - `/empresas`
  - `/pipeline`
  - `/dashboard`
  - `/reunioes`
  - `/configuracoes`
- Modulos independentes:
  - `core`
  - `crm`
  - `prospecting`
  - `scoring`
  - `messaging`
  - `follow-up`
  - `calendar`
  - `meetings`
  - `dashboard`
  - `activities`
  - `settings`
- Clientes Supabase:
  - browser
  - server
  - admin
- Tipos de dominio e tipo base `Database`.
- Script SQL completo do Supabase em `supabase/schema.sql`.
- Documentacao de conexao Supabase.
- Documentacao de deploy continuo.
- Configuracao `vercel.json` para GitHub e Vercel.
- Fluxo GitHub, Vercel e Supabase documentado.
- Template de Pull Request com checklist de preview Vercel.
- Script `npm run ci` para typecheck, lint e build na Vercel.
- Remocao de dependencias auxiliares fora da stack permitida.

## Nao implementado nesta etapa

- Busca real de empresas.
- OpenRouter.
- WhatsApp.
- Google Calendar.
- Integracoes externas.
- Autenticacao visual.
- CRUD operacional dos modulos.
