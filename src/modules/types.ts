export type ModuleStatus = "Fundação pronta" | "Ativo na V1" | "Previsto V2" | "Previsto V3";

export type ModuleDefinition = {
  key: string;
  title: string;
  description: string;
  phase: "Core" | "CRM" | "IA" | "Operação" | "Integrações";
  status: ModuleStatus;
  capabilities: string[];
};
