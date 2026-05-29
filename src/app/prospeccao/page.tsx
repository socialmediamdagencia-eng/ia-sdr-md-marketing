export const dynamic = "force-dynamic";

export default function ProspectingPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-medium text-teal">Prospeccao</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Motor de prospeccao IA SDR</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Tela recuperada em modo seguro. A busca real sera religada depois de isolar o erro
          de execucao da Vercel.
        </p>
      </div>

      <div className="rounded-md border border-line bg-white p-5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-teal">IA SDR</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">Nova busca real</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              O formulario esta preservado, mas o envio ficou pausado temporariamente para
              recuperar a pagina em producao.
            </p>
          </div>
          <span className="w-fit rounded-md border border-line px-3 py-1 text-xs text-slate-600">
            Modo seguro
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-ink">Segmento</span>
            <input
              className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
              placeholder="Ex: clinica odontologica"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-ink">Cidade</span>
            <input
              className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
              placeholder="Ex: Sao Paulo"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-ink">Quantidade</span>
            <input
              className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
              max="30"
              min="1"
              placeholder="Ex: 10"
              type="number"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            className="rounded-md bg-slate-300 px-4 py-2 text-sm font-semibold text-white"
            disabled
            type="button"
          >
            Buscar leads reais
          </button>
        </div>
      </div>

      <div className="rounded-md border border-line bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Campanhas recentes</h2>
        <p className="mt-1 text-sm text-slate-600">
          Historico temporariamente pausado enquanto corrigimos a busca real.
        </p>
      </div>
    </section>
  );
}
