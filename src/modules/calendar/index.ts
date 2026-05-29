import type { ModuleDefinition } from "@/modules/types";

export const calendarModule: ModuleDefinition = {
  key: "calendar",
  title: "Google Calendar",
  description: "Base de integração OAuth e sincronização de eventos para reuniões comerciais.",
  phase: "Integrações",
  status: "Previsto V3",
  capabilities: ["Integrações", "Tokens OAuth", "Eventos externos"]
};
