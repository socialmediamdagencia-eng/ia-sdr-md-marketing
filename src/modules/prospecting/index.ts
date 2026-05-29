import type { ModuleDefinition } from "@/modules/types";

export const prospectingModule: ModuleDefinition = {
  key: "prospecting",
  title: "Prospecção",
  description: "Campanhas por segmento e cidade, resultados normalizados e jobs de enriquecimento.",
  phase: "Operação",
  status: "Ativo na V1",
  capabilities: ["Campanhas", "Resultados de prospecção", "Fontes de dados", "Enriquecimento"]
};
