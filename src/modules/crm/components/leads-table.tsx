import type { LeadSummary } from "@/modules/crm/types";

const statusLabels: Record<string, string> = {
  new: "Novo",
  qualified: "Qualificado",
  contacted: "Contatado",
  replied: "Respondeu",
  meeting_scheduled: "Reuniao marcada",
  proposal_sent: "Proposta enviada",
  won: "Ganhou",
  lost: "Perdido",
  archived: "Arquivado"
};

const temperatureLabels: Record<string, string> = {
  cold: "Frio",
  warm: "Morno",
  hot: "Quente"
};

export function LeadsTable({ leads }: { leads: LeadSummary[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-white">
      <div className="border-b border-line p-5">
        <h2 className="text-lg font-semibold text-ink">Leads cadastrados</h2>
        <p className="mt-1 text-sm text-slate-600">{leads.length} leads no CRM.</p>
      </div>

      {leads.length === 0 ? (
        <div className="p-8 text-sm text-slate-600">Nenhum lead cadastrado ainda.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Temperatura</th>
                <th className="px-4 py-3 font-medium">Origem</th>
                <th className="px-4 py-3 font-medium">Proximo follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-4 py-3 font-medium text-ink">{lead.companyName}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {statusLabels[lead.status] ?? lead.status}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {temperatureLabels[lead.temperature] ?? lead.temperature}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{lead.origin || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{lead.nextFollowUpAt || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
