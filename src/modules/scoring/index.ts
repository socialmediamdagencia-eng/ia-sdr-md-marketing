import type { ModuleDefinition } from "@/modules/types";

export const scoringModule: ModuleDefinition = {
  key: "scoring",
  title: "Score Comercial",
  description: "Histórico de score, critérios comerciais, dores prováveis e oportunidades por lead.",
  phase: "IA",
  status: "Ativo na V1",
  capabilities: ["Score total", "Score por dimensão", "Insights", "Regras comerciais"]
};
