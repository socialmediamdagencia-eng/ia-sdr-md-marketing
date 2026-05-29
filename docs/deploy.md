# Deploy continuo

## Ambiente oficial

Use Vercel para o frontend Next.js e Supabase para banco, auth e storage.

Toda validacao funcional deve acontecer pela URL de preview da Vercel.

## Variaveis de ambiente

Configure na Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Build da Vercel

O arquivo `vercel.json` define:

```json
{
  "framework": "nextjs",
  "installCommand": "npm ci",
  "buildCommand": "npm run ci"
}
```

O comando `npm run ci` executa:

```bash
npm run typecheck
npm run lint
npm run build
```

## Passos

1. Subir o repositorio para GitHub.
2. Criar o projeto no Supabase.
3. Executar `supabase/schema.sql`.
4. Importar o repositorio na Vercel.
5. Configurar variaveis de ambiente na Vercel.
6. Abrir Pull Request para gerar uma URL de preview.
7. Validar a aplicacao pela URL de preview.
8. Registrar a URL de preview no Pull Request.

## Regras

- Nao usar Docker.
- Nao depender de processos manuais no computador.
- Nao aprovar etapa apenas com `localhost`.
- Nao adicionar dependencias fora da stack permitida sem aprovacao explicita.

## Proximas etapas de producao

- criar fluxo de onboarding da primeira organizacao
- ativar autenticacao Supabase
- configurar dominio
- configurar ambientes separados: desenvolvimento, staging e producao
