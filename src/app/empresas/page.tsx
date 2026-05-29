import { CompaniesTable } from "@/modules/crm/components/companies-table";
import { CompanyForm } from "@/modules/crm/components/company-form";
import { getCompanies } from "@/modules/crm/services/crm-queries";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-medium text-teal">CRM</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Empresas</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Base de empresas da operacao comercial. Cadastre empresas manualmente
          agora; a prospeccao automatizada entra em uma proxima etapa.
        </p>
      </div>

      <CompanyForm />
      <CompaniesTable companies={companies} />
    </section>
  );
}
