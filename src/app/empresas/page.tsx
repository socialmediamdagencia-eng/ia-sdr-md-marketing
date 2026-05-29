import { ModulePlaceholder } from "@/components/ui/module-placeholder";
import { crmModule } from "@/modules/crm";

export default function CompaniesPage() {
  return (
    <ModulePlaceholder
      module={{
        ...crmModule,
        title: "Empresas",
        description: "Base CRM de empresas, contatos, origem dos dados e confiança comercial."
      }}
    />
  );
}
