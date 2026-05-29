import type { ModuleDefinition } from "@/modules/types";

export const meetingsModule: ModuleDefinition = {
  key: "meetings",
  title: "Reuniões",
  description: "Agenda, participantes, notas, resumos de IA e próximos passos vinculados ao CRM.",
  phase: "Operação",
  status: "Previsto V3",
  capabilities: ["Reuniões", "Participantes", "Notas", "Resumo de IA"]
};
