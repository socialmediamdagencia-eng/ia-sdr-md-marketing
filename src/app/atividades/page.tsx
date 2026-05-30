import { getActivities } from "@/modules/activities/services/activity-queries";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo"
  }).format(new Date(value));
}

export default async function ActivitiesPage() {
  const activities = await getActivities();

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-medium text-teal">Histórico</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Atividades</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Linha do tempo da operação comercial: prospecção, leads, mensagens, reuniões,
          alterações e próximos passos.
        </p>
      </div>

      <div className="rounded-md border border-line bg-white">
        <div className="border-b border-line p-5">
          <h2 className="text-lg font-semibold text-ink">Linha do tempo</h2>
          <p className="mt-1 text-sm text-slate-600">{activities.length} registros recentes.</p>
        </div>
        <div className="divide-y divide-line">
          {activities.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">Nenhuma atividade registrada ainda.</p>
          ) : (
            activities.map((activity) => (
              <article key={activity.id} className="grid gap-2 p-5 lg:grid-cols-[180px_1fr]">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{activity.type}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatDate(activity.occurredAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{activity.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {activity.description || "Sem descrição adicional."}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
