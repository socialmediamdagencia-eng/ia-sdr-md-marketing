import { completeTaskAction } from "@/modules/follow-up/actions";
import { getFollowUpTasks } from "@/modules/follow-up/services/follow-up-queries";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  canceled: "Cancelado",
  completed: "Concluido",
  in_progress: "Em andamento",
  pending: "Pendente"
};

const priorityLabels: Record<string, string> = {
  high: "Alta",
  low: "Baixa",
  medium: "Media",
  urgent: "Urgente"
};

function formatDate(value: string) {
  if (!value) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo"
  }).format(new Date(value));
}

export default async function FollowUpPage() {
  const tasks = await getFollowUpTasks();
  const pending = tasks.filter((task) => task.status !== "completed");
  const completed = tasks.filter((task) => task.status === "completed");

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-medium text-teal">Follow-up</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Agenda comercial da IA SDR</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Tarefas criadas automaticamente pela prospeccao, mensagens e Copiloto WhatsApp
          para nenhum lead esfriar sem proxima acao.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-line bg-white p-5">
          <p className="text-sm text-slate-500">Pendentes</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{pending.length}</p>
        </div>
        <div className="rounded-md border border-line bg-white p-5">
          <p className="text-sm text-slate-500">Concluidos</p>
          <p className="mt-2 text-3xl font-semibold text-teal">{completed.length}</p>
        </div>
        <div className="rounded-md border border-line bg-white p-5">
          <p className="text-sm text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-semibold text-[#4D6BFF]">{tasks.length}</p>
        </div>
      </div>

      <div className="rounded-md border border-line bg-white">
        <div className="border-b border-line p-5">
          <h3 className="text-lg font-semibold text-ink">Proximas acoes</h3>
          <p className="mt-1 text-sm text-slate-600">{tasks.length} tarefas registradas.</p>
        </div>

        <div className="divide-y divide-line">
          {tasks.length === 0 ? (
            <p className="p-6 text-sm text-slate-600">
              Nenhuma tarefa ainda. Quando a IA analisar conversas ou abrir WhatsApp,
              ela cria os proximos passos aqui.
            </p>
          ) : (
            tasks.map((task) => (
              <article key={task.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_180px_140px_140px] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-ink">{task.title}</h4>
                    <span className="rounded-md bg-[#E8ECFF] px-2 py-1 text-xs text-[#4D6BFF]">
                      {priorityLabels[task.priority] ?? task.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{task.companyName}</p>
                  {task.description ? (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                      {task.description}
                    </p>
                  ) : null}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Data</p>
                  <p className="mt-1 text-sm text-ink">{formatDate(task.dueAt)}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                  <p className="mt-1 text-sm text-ink">{statusLabels[task.status] ?? task.status}</p>
                </div>

                {task.status === "completed" ? (
                  <span className="rounded-md border border-line px-3 py-2 text-center text-sm text-slate-500">
                    Feito
                  </span>
                ) : (
                  <form action={completeTaskAction}>
                    <input name="task_id" type="hidden" value={task.id} />
                    <button
                      className="w-full rounded-md bg-teal px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal/90"
                      type="submit"
                    >
                      Concluir
                    </button>
                  </form>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
