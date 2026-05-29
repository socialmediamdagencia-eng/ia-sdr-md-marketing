type CommercialChartsProps = {
  companies: number;
  leads: number;
  activities: number;
};

function percent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.max(8, Math.min(100, Math.round((value / total) * 100)));
}

export function CommercialCharts({ companies, leads, activities }: CommercialChartsProps) {
  const maxValue = Math.max(companies, leads, activities, 1);
  const qualification = companies > 0 ? Math.round((leads / companies) * 100) : 0;
  const meetingsGoal = Math.max(1, Math.ceil(leads * 0.35));
  const coverage = Math.min(100, companies * 12 + leads * 18 + activities * 8);

  const funnel = [
    { label: "Empresas mapeadas", value: companies, width: percent(companies, maxValue) },
    { label: "Leads qualificados", value: leads, width: percent(leads, maxValue) },
    { label: "Toques comerciais", value: activities, width: percent(activities, maxValue) }
  ];

  const bars = [
    { label: "Empresas", value: companies, color: "from-[#486DFF] to-[#8EA4FF]" },
    { label: "Leads", value: leads, color: "from-[#21D4FD] to-[#486DFF]" },
    { label: "Atividades", value: activities, color: "from-[#D25A43] to-[#FFB36C]" }
  ];

  return (
    <section className="rounded-md border border-[#1B2A5A] bg-[#060A16] p-5 text-white shadow-soft">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#7EA0FF]">
            Dashboard comercial
          </p>
          <h2 className="mt-1 text-2xl font-semibold">Central de performance IA SDR</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Visao clara do funil, ritmo de abordagem e preparacao para reunioes.
          </p>
        </div>
        <span className="w-fit rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs">
          Tempo real
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md border border-white/10 bg-white/[0.06] p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Empresas</p>
          <p className="mt-2 text-4xl font-semibold">{companies}</p>
          <p className="mt-1 text-xs text-[#8EA4FF]">base comercial</p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.06] p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Leads</p>
          <p className="mt-2 text-4xl font-semibold text-[#7EA0FF]">{leads}</p>
          <p className="mt-1 text-xs text-[#8EA4FF]">oportunidades</p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.06] p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Meta reunioes</p>
          <p className="mt-2 text-4xl font-semibold text-[#21D4FD]">{meetingsGoal}</p>
          <p className="mt-1 text-xs text-[#8EA4FF]">estimativa inicial</p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.06] p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Cobertura</p>
          <p className="mt-2 text-4xl font-semibold text-[#FFB36C]">{coverage}%</p>
          <p className="mt-1 text-xs text-[#8EA4FF]">operacao ativa</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Funil de prospeccao</p>
            <span className="text-xs text-slate-400">V1</span>
          </div>
          <div className="mt-6 space-y-5">
            {funnel.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-10 overflow-hidden rounded-md bg-white/10">
                  <div
                    className="flex h-full items-center justify-end rounded-md bg-gradient-to-r from-[#486DFF] via-[#6B7DFF] to-[#21D4FD] px-3 text-sm font-semibold text-white"
                    style={{ width: `${item.width}%` }}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Conversao inicial</p>
            <span className="text-xs text-slate-400">empresas em leads</span>
          </div>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row xl:flex-col">
            <div
              className="grid h-44 w-44 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#21D4FD ${qualification}%, #486DFF ${qualification}% ${Math.max(
                  qualification,
                  coverage
                )}%, rgba(255,255,255,0.12) 0)`
              }}
            >
              <div className="grid h-28 w-28 place-items-center rounded-full bg-[#060A16]">
                <span className="text-4xl font-semibold text-white">{qualification}%</span>
              </div>
            </div>
            <p className="max-w-xs text-center text-sm leading-6 text-slate-300">
              Quanto da base ja virou oportunidade comercial acompanhada.
            </p>
          </div>
        </div>

        <div className="rounded-md border border-white/10 bg-white/[0.04] p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Volume por modulo</p>
            <span className="text-xs text-slate-400">cadastros e eventos</span>
          </div>
          <div className="mt-5 flex h-64 items-end gap-4 border-b border-l border-white/10 px-4">
            {bars.map((bar) => (
              <div key={bar.label} className="flex flex-1 flex-col items-center gap-3">
                <div
                  className={`w-full rounded-t-md bg-gradient-to-t ${bar.color}`}
                  style={{ height: `${percent(bar.value, maxValue)}%` }}
                  title={`${bar.label}: ${bar.value}`}
                />
                <span className="text-xs text-slate-300">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
