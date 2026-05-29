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
import { getSystemHealth } from "@/modules/core/services/system-health";
import { getCrmCounts } from "@/modules/crm/services/crm-queries";
import { CommercialCharts } from "@/modules/dashboard/components/commercial-charts";

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

export async function DashboardOverview() {
  const [systemHealth, crmCounts] = await Promise.all([getSystemHealth(), getCrmCounts()]);

  const metrics = [
    { label: "Empresas", value: String(crmCounts.companies), color: "text-ink" },
    { label: "Leads", value: String(crmCounts.leads), color: "text-teal" },
    { label: "Atividades", value: String(crmCounts.activities), color: "text-coral" },
    { label: "Integracoes externas", value: "0", color: "text-amber" }
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-medium text-teal">Etapa 3</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">
          CRM inicial da IA SDR da MD Marketing
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Fundacao conectada ao Supabase, com cadastro manual de empresas e leads
          para validar o fluxo operacional da V1.
        </p>
      </div>

      <CommercialCharts
        activities={crmCounts.activities}
        campaigns={crmCounts.campaigns}
        companies={crmCounts.companies}
        foundProspects={crmCounts.foundProspects}
        leads={crmCounts.leads}
        requestedProspects={crmCounts.requestedProspects}
        statusCounts={crmCounts.statusCounts}
        temperatureCounts={crmCounts.temperatureCounts}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-md border border-line bg-white p-5">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${metric.color}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-line bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Infraestrutura
            </p>
            <h3 className="mt-1 text-base font-semibold text-ink">Status Supabase</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{systemHealth.summary}</p>
          </div>
          <span
            className={`inline-flex w-fit items-center rounded-md border px-3 py-1 text-xs font-medium ${
              systemHealth.status === "ready"
                ? "border-teal/20 bg-teal/10 text-teal"
                : "border-coral/20 bg-coral/10 text-coral"
            }`}
          >
            {systemHealth.status === "ready" ? "Conectado" : "Atencao"}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {systemHealth.checks.map((check) => (
            <div key={check.label} className="rounded-md border border-line bg-mist p-3">
              <p className="text-sm font-medium text-ink">{check.label}</p>
              <p
                className={`mt-1 text-xs ${
                  check.status === "ready" ? "text-teal" : "text-coral"
                }`}
              >
                {check.detail}
              </p>
            </div>
          ))}
        </div>
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
