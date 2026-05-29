import { runProspectingCampaignAction } from "@/modules/prospecting/actions";

export function ProspectingForm() {
  return (
    <form action={runProspectingCampaignAction} className="rounded-md border border-line bg-white p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-teal">IA SDR</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">Nova prospeccao</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Informe o segmento, cidade e quantidade. A V1 gera empresas, decisores, leads,
            score, dores, oportunidades e mensagem inicial.
          </p>
        </div>
        <span className="w-fit rounded-md border border-line px-3 py-1 text-xs text-slate-600">
          Simulador operacional V1
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Segmento</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            name="segment"
            placeholder="Ex: clinica odontologica"
            required
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Cidade</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            name="city"
            placeholder="Ex: Sao Paulo"
            required
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Quantidade</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            max="50"
            min="1"
            name="quantity"
            placeholder="Ex: 10"
            required
            type="number"
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          className="rounded-md bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal/90"
          type="submit"
        >
          Gerar leads
        </button>
      </div>
    </form>
  );
}
