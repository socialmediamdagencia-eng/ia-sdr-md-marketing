import type { ModuleDefinition } from "@/modules/types";

export const dashboardModule: ModuleDefinition = {
  key: "dashboard",
  title: "Dashboard",
  description: "Indicadores comerciais, funil, prospecção, reuniões e produtividade da operação SDR.",
  phase: "Operação",
  status: "Fundação pronta",
  capabilities: ["Métricas comerciais", "Funil", "Prospecção", "Follow-ups"]
};
