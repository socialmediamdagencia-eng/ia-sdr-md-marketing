import type { ModuleDefinition } from "@/modules/types";

export const coreModule: ModuleDefinition = {
  key: "core",
  title: "Core",
  description: "Base multi-organização, perfis, permissões e configurações globais.",
  phase: "Core",
  status: "Fundação pronta",
  capabilities: ["Organizações", "Perfis de usuário", "Configurações por chave"]
};
