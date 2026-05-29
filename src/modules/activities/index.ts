import type { ModuleDefinition } from "@/modules/types";

export const activitiesModule: ModuleDefinition = {
  key: "activities",
  title: "Histórico de Atividades",
  description: "Timeline auditável para ações de sistema, usuário, lead, empresa, tarefa e reunião.",
  phase: "Operação",
  status: "Ativo na V1",
  capabilities: ["Timeline", "Eventos do sistema", "Auditoria comercial"]
};
