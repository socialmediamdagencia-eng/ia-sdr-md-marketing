# Changelog - Etapa 5

## Entregue

- Prospecção conectada a busca pública experimental.
- Remoção da geração de telefones fictícios no fluxo principal.
- Normalização de resultados públicos em empresas, contatos e leads.
- Extração inicial de telefone, Instagram, site e possível decisor quando o dado aparece publicamente.
- Registro de confiança dos dados por empresa e contato.
- Campanhas agora podem ficar como `completed`, `partial` ou `failed`.
- Mensagens continuam sendo geradas com base no playbook da MD Marketing.

## Limites conhecidos

- A busca pública gratuita não garante telefone em todos os resultados.
- O sistema não inventa telefone, dono ou WhatsApp.
- Para qualidade alta e escala maior, o produto deve evoluir para fontes/API de dados ou enriquecimento dedicado.

## Validacao

- `npm run typecheck`
- `npm run lint`
- `npm run build`
