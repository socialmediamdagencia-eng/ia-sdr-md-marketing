type CommercialChartsProps = {
  companies: number;
  leads: number;
  activities: number;
};

function percent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.max(6, Math.min(100, Math.round((value / total) * 100)));
}

export function CommercialCharts({ companies, leads, activities }: CommercialChartsProps) {
  const maxValue = Math.max(companies, leads, activities, 1);
  const qualification = companies > 0 ? Math.round((leads / companies) * 100) : 0;

  const funnel = [
    { label: "Empresas", value: companies, width: percent(companies, maxValue) },
    { label: "Leads", value: leads, width: percent(leads, maxValue) },
    { label: "Atividades", value: activities, width: percent(activities, maxValue) }
  ];

  const bars = [
    { label: "Empresas", value: companies },
    { label: "Leads", value: leads },
    { label: "Ativ.", value: activities }
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="rounded-md border border-[#25335F] bg-ink p-5 text-white shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#7EA0FF]">
              Painel comercial
            </p>
            <h2 className="mt-1 text-xl font-semibold">Visao geral da operacao</h2>
          </div>
          <span className="w-fit rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs">
            V1 CRM
          </span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-medium text-white">Funil inicial</p>
            <div className="mt-5 space-y-4">
              {funnel.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-8 overflow-hidden rounded-md bg-white/10">
                    <div
                      className="flex h-full items-center justify-end rounded-md bg-[#486DFF] px-3 text-xs font-semibold text-white"
                      style={{ width: `${item.width}%` }}
                    >
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">Volume por modulo</p>
              <span className="text-xs text-slate-400">tempo real</span>
            </div>
            <div className="mt-5 flex h-56 items-end gap-4 border-b border-l border-white/10 px-4">
              {bars.map((bar) => (
                <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-[#486DFF] to-[#7EA0FF]"
                    style={{ height: `${percent(bar.value, maxValue)}%` }}
                    title={`${bar.label}: ${bar.value}`}
                  />
                  <span className="text-xs text-slate-300">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <div className="rounded-md border border-line bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Conversao inicial
          </p>
          <div className="mt-5 flex items-center gap-5">
            <div
              className="grid h-28 w-28 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#486DFF ${qualification}%, #E7ECFA 0)`
              }}
            >
              <div className="grid h-20 w-20 place-items-center rounded-full bg-white">
                <span className="text-2xl font-semibold text-ink">{qualification}%</span>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">Empresas em leads</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Percentual de empresas cadastradas que ja viraram oportunidade comercial.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-line bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Proxima prioridade
          </p>
          <h3 className="mt-2 text-lg font-semibold text-ink">Prospecção e mensagens</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            O proximo bloco vai gerar leads em campanha, aplicar a base comercial da MD e
            preparar abordagem por WhatsApp.
          </p>
        </div>
      </div>
    </section>
  );
}
