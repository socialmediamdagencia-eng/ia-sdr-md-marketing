import { getLeads } from "@/modules/crm/services/crm-queries";

export const dynamic = "force-dynamic";

const columns = [
  { key: "new", label: "Novo" },
  { key: "qualified", label: "Qualificado" },
  { key: "contacted", label: "Abordado" },
  { key: "replied", label: "Respondeu" },
  { key: "meeting_scheduled", label: "Reuniao marcada" },
  { key: "proposal_sent", label: "Proposta enviada" },
  { key: "won", label: "Fechado" },
  { key: "lost", label: "Nao fechado" }
];

const temperatureLabels: Record<string, string> = {
  cold: "Frio",
  hot: "Quente",
  warm: "Morno"
};

export default async function PipelinePage() {
  const leads = await getLeads();

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-medium text-teal">CRM</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Pipeline comercial</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Visao do funil da IA SDR: do lead novo ate reuniao, proposta e fechamento.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map((column) => {
          const items = leads.filter((lead) => lead.status === column.key);

          return (
            <div key={column.key} className="rounded-md border border-line bg-white">
              <div className="flex items-center justify-between border-b border-line p-4">
                <h3 className="text-sm font-semibold text-ink">{column.label}</h3>
                <span className="rounded-md border border-line px-2 py-1 text-xs text-slate-600">
                  {items.length}
                </span>
              </div>
              <div className="min-h-[180px] space-y-3 bg-mist/70 p-3">
                {items.length === 0 ? (
                  <p className="rounded-md border border-dashed border-line bg-white p-3 text-xs text-slate-500">
                    Nenhum lead nesta etapa.
                  </p>
                ) : (
                  items.map((lead) => (
                    <article key={lead.id} className="rounded-md border border-line bg-white p-3">
                      <p className="text-sm font-semibold text-ink">{lead.companyName}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-md bg-[#E8ECFF] px-2 py-1 text-[#4D6BFF]">
                          {temperatureLabels[lead.temperature] ?? lead.temperature}
                        </span>
                        <span className="rounded-md bg-white px-2 py-1 text-slate-500 ring-1 ring-line">
                          {lead.origin || "manual"}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        Follow-up: {lead.nextFollowUpAt || "sem data"}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
