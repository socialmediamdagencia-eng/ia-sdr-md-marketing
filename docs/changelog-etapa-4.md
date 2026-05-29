# Changelog - Etapa 4

## Entregue

- Tela de prospeccao funcional em `/prospeccao`.
- Criacao de campanhas por segmento, cidade e quantidade.
- Geracao V1 de empresas, contatos decisores, leads e resultados de prospeccao.
- Score comercial inicial por lead.
- Dores provaveis, oportunidades e oferta recomendada por lead.
- Mensagem inicial de WhatsApp baseada no playbook da MD Marketing.
- Tela `/mensagens` com cards completos por lead.
- Botao `Abrir WhatsApp` com mensagem pronta.
- Dashboard passa a refletir campanhas, prospectados, leads e atividades.

## Observacao

Esta etapa ainda nao usa APIs externas de busca nem envio automatico de WhatsApp.
O objetivo e validar o fluxo operacional completo dentro da Vercel e Supabase antes
de conectar provedores pagos ou o futuro Copiloto WhatsApp.

## Validacao

- `npm run typecheck`
- `npm run lint`
- `npm run build`
