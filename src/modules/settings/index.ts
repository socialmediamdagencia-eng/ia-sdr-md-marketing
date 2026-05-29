import type { ModuleDefinition } from "@/modules/types";

export const settingsModule: ModuleDefinition = {
  key: "settings",
  title: "Configurações",
  description: "Dados da MD Marketing, tom de voz, ofertas, prompts, pipeline e integrações.",
  phase: "Core",
  status: "Fundação pronta",
  capabilities: ["Configurações da empresa", "IA SDR", "Pipeline", "Integrações"]
};
