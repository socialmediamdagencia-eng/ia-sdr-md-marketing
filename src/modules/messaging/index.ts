import type { ModuleDefinition } from "@/modules/types";

export const messagingModule: ModuleDefinition = {
  key: "messaging",
  title: "Mensagens",
  description: "Templates, mensagens geradas por IA e histórico de eventos por canal.",
  phase: "IA",
  status: "Ativo na V1",
  capabilities: ["Templates", "Mensagens geradas", "Eventos de mensagem"]
};
