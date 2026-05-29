import { ModulePlaceholder } from "@/components/ui/module-placeholder";
import { crmModule } from "@/modules/crm";

export default function PipelinePage() {
  return (
    <ModulePlaceholder
      module={{
        ...crmModule,
        title: "Pipeline",
        description: "Funil comercial preparado para kanban, etapas, probabilidades e responsáveis."
      }}
    />
  );
}
