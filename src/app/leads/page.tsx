import { LeadForm } from "@/modules/crm/components/lead-form";
import { LeadsTable } from "@/modules/crm/components/leads-table";
import { getCompanies, getLeads } from "@/modules/crm/services/crm-queries";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const [companies, leads] = await Promise.all([getCompanies(), getLeads()]);

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-medium text-teal">CRM</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Leads</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Oportunidades comerciais vinculadas a empresas. Nesta etapa, o lead e
          criado manualmente para validar o fluxo real com Supabase.
        </p>
      </div>

      <LeadForm companies={companies} />
      <LeadsTable leads={leads} />
    </section>
  );
}
