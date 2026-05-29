# Conexão Supabase

## 1. Criar projeto

1. Acesse o Supabase.
2. Crie um novo projeto.
3. Abra `Project Settings > API`.
4. Copie:
   - Project URL
   - anon public key
   - service_role key

## 2. Configurar variáveis

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend.

## 3. Criar banco

1. Abra `SQL Editor` no Supabase.
2. Cole o conteúdo de `supabase/schema.sql`.
3. Execute o script completo.

O script cria:

- enums
- tabelas definitivas
- índices
- triggers de `updated_at`
- função auxiliar de organização
- RLS
- políticas de acesso por organização

## 4. Observação sobre primeiro acesso

As políticas RLS assumem que o usuário já possui um registro em `profiles`.
Para o primeiro usuário de uma organização, crie a organização e o perfil via operação administrativa usando service role, migration seed ou SQL controlado.
