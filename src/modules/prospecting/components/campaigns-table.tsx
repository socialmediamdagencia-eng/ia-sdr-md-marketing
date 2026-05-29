import type { ProspectingCampaignSummary } from "@/modules/prospecting/services/prospecting-queries";

const statusLabels: Record<string, string> = {
  completed: "Concluida",
  draft: "Rascunho",
  failed: "Erro",
  partial: "Parcial",
  pending: "Pendente",
  processing: "Buscando"
};

export function CampaignsTable({ campaigns }: { campaigns: ProspectingCampaignSummary[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-white">
      <div className="border-b border-line p-5">
        <h2 className="text-lg font-semibold text-ink">Campanhas recentes</h2>
        <p className="mt-1 text-sm text-slate-600">{campaigns.length} campanhas registradas.</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="p-8 text-sm text-slate-600">
          Nenhuma campanha ainda. Gere a primeira prospeccao acima.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Campanha</th>
                <th className="px-4 py-3 font-medium">Segmento</th>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 font-medium">Solicitados</th>
                <th className="px-4 py-3 font-medium">Encontrados</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Observacao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-4 py-3 font-medium text-ink">{campaign.name}</td>
                  <td className="px-4 py-3 text-slate-600">{campaign.segment}</td>
                  <td className="px-4 py-3 text-slate-600">{campaign.city}</td>
                  <td className="px-4 py-3 text-slate-600">{campaign.requestedQuantity}</td>
                  <td className="px-4 py-3 text-slate-600">{campaign.foundQuantity}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {statusLabels[campaign.status] ?? campaign.status}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{campaign.errorMessage || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
