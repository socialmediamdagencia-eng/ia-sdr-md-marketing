import type { ModuleDefinition } from "@/modules/types";

export const crmModule: ModuleDefinition = {
  key: "crm",
  title: "CRM",
  description: "Empresas, contatos, leads, pipeline e vínculo entre origem, responsável e estágio comercial.",
  phase: "CRM",
  status: "Ativo na V1",
  capabilities: ["Empresas", "Contatos", "Leads", "Pipeline comercial"]
};
