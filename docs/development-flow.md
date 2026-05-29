# Fluxo de desenvolvimento

Este projeto usa Vercel como ambiente obrigatorio de build e validacao.

## Regra central

O computador local nao e ambiente oficial de validacao.

Qualquer funcionalidade nova so pode avancar depois de validada por uma URL de preview da Vercel.

## Stack permitida

- Next.js
- TypeScript
- Tailwind CSS
- Supabase

Nao adicionar bibliotecas, servicos, runtimes ou ferramentas fora dessa lista sem aprovacao explicita.

## Fluxo GitHub, Vercel e Supabase

1. Criar uma branch no GitHub.
2. Implementar a mudanca no projeto.
3. Abrir Pull Request.
4. A Vercel cria automaticamente uma URL de preview.
5. A Vercel executa `npm run ci`.
6. Validar a mudanca pela URL de preview.
7. Registrar a URL e o resultado no Pull Request.
8. So depois seguir para a proxima etapa.

## Validacao

A validacao padrao e:

```bash
npm run ci
```

Na Vercel, esse comando executa:

```bash
npm run typecheck
npm run lint
npm run build
```

## Proibido

- Docker.
- Jobs que dependam do computador local.
- Processos manuais obrigatorios fora de GitHub, Vercel e Supabase.
- Testar a aprovacao de etapa apenas em `localhost`.
- Dependencias extras sem aprovacao.

## Supabase

O schema fica versionado em:

```txt
supabase/schema.sql
```

Mudancas de banco devem ser feitas primeiro nesse arquivo e depois aplicadas no Supabase do ambiente correto.
