import { ModulePlaceholder } from "@/components/ui/module-placeholder";
import { crmModule } from "@/modules/crm";

export default function LeadsPage() {
  return (
    <ModulePlaceholder
      module={{
        ...crmModule,
        title: "Leads",
        description: "Oportunidades comerciais qualificadas para abordagem e acompanhamento."
      }}
    />
  );
}
