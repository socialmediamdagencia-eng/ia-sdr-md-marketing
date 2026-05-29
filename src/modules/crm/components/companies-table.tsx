import type { CompanySummary } from "@/modules/crm/types";

export function CompaniesTable({ companies }: { companies: CompanySummary[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-white">
      <div className="border-b border-line p-5">
        <h2 className="text-lg font-semibold text-ink">Empresas cadastradas</h2>
        <p className="mt-1 text-sm text-slate-600">{companies.length} empresas no CRM.</p>
      </div>

      {companies.length === 0 ? (
        <div className="p-8 text-sm text-slate-600">Nenhuma empresa cadastrada ainda.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Segmento</th>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Instagram</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">Confianca</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {companies.map((company) => (
                <tr key={company.id}>
                  <td className="px-4 py-3 font-medium text-ink">{company.name}</td>
                  <td className="px-4 py-3 text-slate-600">{company.segment || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {[company.city, company.state].filter(Boolean).join(" / ") || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{company.phone || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{company.instagramUrl || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{company.websiteUrl || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{company.dataConfidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
