import { createLeadAction } from "@/modules/crm/actions";
import type { CompanySummary } from "@/modules/crm/types";

export function LeadForm({ companies }: { companies: CompanySummary[] }) {
  return (
    <form action={createLeadAction} className="rounded-md border border-line bg-white p-5">
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Leads</p>
        <h2 className="mt-1 text-lg font-semibold text-ink">Novo lead</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1 text-sm xl:col-span-2">
          <span className="font-medium text-ink">Empresa</span>
          <select
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-teal"
            name="company_id"
            required
          >
            <option value="">Selecione uma empresa</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Status</span>
          <select
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-teal"
            name="status"
          >
            <option value="new">Novo</option>
            <option value="qualified">Qualificado</option>
            <option value="contacted">Contatado</option>
            <option value="replied">Respondeu</option>
            <option value="meeting_scheduled">Reuniao marcada</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Temperatura</span>
          <select
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-teal"
            name="temperature"
          >
            <option value="cold">Frio</option>
            <option value="warm">Morno</option>
            <option value="hot">Quente</option>
          </select>
        </label>
        <label className="space-y-1 text-sm xl:col-span-2">
          <span className="font-medium text-ink">Origem</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            name="origin"
            placeholder="manual"
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          className="rounded-md bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal/90 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={companies.length === 0}
          type="submit"
        >
          Salvar lead
        </button>
      </div>
    </form>
  );
}
