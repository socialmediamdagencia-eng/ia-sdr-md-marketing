import {
  activitiesModule,
  calendarModule,
  coreModule,
  crmModule,
  dashboardModule,
  followUpModule,
  meetingsModule,
  messagingModule,
  prospectingModule,
  scoringModule,
  settingsModule
} from "@/modules";

const metrics = [
  { label: "Módulos planejados", value: "11", color: "text-ink" },
  { label: "Ativos na V1", value: "6", color: "text-teal" },
  { label: "Tabelas base", value: "28", color: "text-coral" },
  { label: "Integrações externas", value: "0", color: "text-amber" }
];

const modules = [
  coreModule,
  crmModule,
  prospectingModule,
  scoringModule,
  messagingModule,
  followUpModule,
  calendarModule,
  meetingsModule,
  dashboardModule,
  activitiesModule,
  settingsModule
];

export function DashboardOverview() {
  return (
    <section className="space-y-6">
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-medium text-teal">Etapa 1</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">
          Fundação da IA SDR da MD Marketing
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Estrutura preparada para CRM, prospecção, score comercial, mensagens,
          follow-up, reuniões, integrações, dashboard, atividades e configurações.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-md border border-line bg-white p-5">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${metric.color}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {modules.map((module) => (
          <div key={module.key} className="rounded-md border border-line bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {module.phase}
                </p>
                <h3 className="mt-1 text-base font-semibold text-ink">{module.title}</h3>
              </div>
              <span className="rounded-md border border-line px-2 py-1 text-xs text-slate-600">
                {module.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{module.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
