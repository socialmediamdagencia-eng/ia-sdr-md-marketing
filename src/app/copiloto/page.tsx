import { analyzeConversationAction } from "@/modules/messaging/copilot-actions";
import { getCopilotData } from "@/modules/messaging/services/copilot-queries";

export const dynamic = "force-dynamic";

const objectiveOptions = [
  { label: "Responder e manter conversa", value: "responder" },
  { label: "Tentar marcar reuniao", value: "marcar_reuniao" },
  { label: "Contornar objecao", value: "contornar_objecao" },
  { label: "Enviar proposta", value: "enviar_proposta" }
];

const statusLabels: Record<string, string> = {
  contacted: "Abordado",
  lost: "Nao fechado",
  meeting_scheduled: "Reuniao marcada",
  new: "Novo",
  proposal_sent: "Proposta enviada",
  qualified: "Qualificado",
  replied: "Respondeu",
  won: "Fechado"
};

export default async function CopilotPage() {
  const data = await getCopilotData();

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-medium text-teal">Copiloto WhatsApp</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">IA para responder conversas</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Cole aqui a resposta do cliente. A IA analisa o contexto, gera a proxima
          mensagem, atualiza o status do lead e cria o follow-up automaticamente.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form action={analyzeConversationAction} className="rounded-md border border-line bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Atendimento assistido
              </p>
              <h3 className="mt-1 text-xl font-semibold text-ink">Nova analise de conversa</h3>
            </div>
            <span className="rounded-md border border-[#273A7A] bg-[#071029] px-3 py-1 text-xs font-medium text-white">
              Gratis
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-ink">Lead</span>
              <select
                className="w-full rounded-md border border-line bg-white px-3 py-3 text-sm outline-none focus:border-[#4D6BFF]"
                name="lead_id"
                required
              >
                <option value="">Selecione um lead</option>
                {data.leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.companyName} - {statusLabels[lead.status] ?? lead.status}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-ink">Objetivo da resposta</span>
              <select
                className="w-full rounded-md border border-line bg-white px-3 py-3 text-sm outline-none focus:border-[#4D6BFF]"
                name="objective"
              >
                {objectiveOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-5 block space-y-2">
            <span className="text-sm font-medium text-ink">Conversa do WhatsApp</span>
            <textarea
              className="min-h-[260px] w-full rounded-md border border-line bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-[#4D6BFF]"
              name="conversation"
              placeholder="Cole aqui o que o cliente respondeu. Ex: Maria: quanto custa? / Cliente: quero entender melhor..."
              required
            />
          </label>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              A IA nao envia sozinha nesta versao gratis. Ela escreve a resposta e deixa pronta
              para voce abrir no WhatsApp.
            </p>
            <button
              className="rounded-md bg-[#4D6BFF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3954D9]"
              type="submit"
            >
              Analisar e gerar resposta
            </button>
          </div>
        </form>

        <div className="rounded-md border border-[#172147] bg-[#050814] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7F97FF]">
            Ultimas respostas geradas
          </p>
          <h3 className="mt-2 text-xl font-semibold">Fila do Copiloto</h3>

          <div className="mt-5 space-y-4">
            {data.drafts.length === 0 ? (
              <p className="rounded-md border border-white/10 bg-white/[0.06] p-4 text-sm text-[#C8D2FF]">
                Nenhuma resposta gerada ainda. Assim que um cliente responder, cole a
                conversa aqui para a IA escrever a proxima mensagem.
              </p>
            ) : (
              data.drafts.map((draft) => (
                <article key={draft.id} className="rounded-md border border-white/10 bg-[#0B1020] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-white">{draft.companyName}</p>
                    <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-[#C8D2FF]">
                      {draft.objective}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#D7DFFF]">
                    {draft.message}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
