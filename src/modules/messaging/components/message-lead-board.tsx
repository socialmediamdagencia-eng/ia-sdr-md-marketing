import type { MessageLeadCard } from "@/modules/messaging/services/message-queries";
import { regenerateLeadAiAction } from "@/modules/messaging/actions";
import { WhatsAppActionButton } from "@/modules/messaging/components/whatsapp-action-button";

const temperatureLabels: Record<string, string> = {
  cold: "Frio",
  warm: "Morno",
  hot: "Quente"
};

const statusLabels: Record<string, string> = {
  archived: "Arquivado",
  contacted: "Abordado",
  lost: "Nao fechado",
  meeting_scheduled: "Reuniao marcada",
  new: "Novo",
  proposal_sent: "Proposta enviada",
  qualified: "Qualificado",
  replied: "Respondeu",
  won: "Fechado"
};

export function MessageLeadBoard({ leads }: { leads: MessageLeadCard[] }) {
  return (
    <div className="space-y-4">
      {leads.length === 0 ? (
        <div className="rounded-md border border-line bg-white p-8 text-sm text-slate-600">
          Nenhuma mensagem gerada ainda. Rode uma prospeccao para a IA SDR criar abordagens.
        </div>
      ) : (
        leads.map((lead) => (
          <article key={lead.id} className="rounded-md border border-line bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-teal">
                  {temperatureLabels[lead.temperature] ?? lead.temperature} / Score {lead.score}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-ink">{lead.companyName}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Decisor priorizado: {lead.contactName || "nao identificado"}{" "}
                  {lead.phone ? `- ${lead.phone}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 lg:items-end">
                <span className="w-fit rounded-md border border-line px-3 py-1 text-xs text-slate-600">
                  {statusLabels[lead.status] ?? lead.status}
                </span>
                <form action={regenerateLeadAiAction}>
                  <input name="lead_id" type="hidden" value={lead.id} />
                  <button
                    className="w-fit rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink transition hover:border-teal hover:text-teal"
                    type="submit"
                  >
                    Reprocessar IA
                  </button>
                </form>
                {lead.whatsappUrl ? (
                  <WhatsAppActionButton
                    contactId={lead.contactId}
                    leadId={lead.id}
                    messageId={lead.messageId}
                    url={lead.whatsappUrl}
                  />
              ) : (
                  <span className="w-fit rounded-md border border-line px-3 py-2 text-sm text-slate-500">
                    Sem WhatsApp
                  </span>
              )}
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-md border border-line bg-mist p-4">
                <h3 className="text-sm font-semibold text-ink">Dores provaveis</h3>
                <ul className="mt-3 space-y-2 text-sm leading-5 text-slate-600">
                  {lead.pains.slice(0, 4).map((pain) => (
                    <li key={pain}>{pain}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-line bg-mist p-4">
                <h3 className="text-sm font-semibold text-ink">Oportunidades</h3>
                <ul className="mt-3 space-y-2 text-sm leading-5 text-slate-600">
                  {lead.opportunities.slice(0, 4).map((opportunity) => (
                    <li key={opportunity}>{opportunity}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-line bg-mist p-4">
                <h3 className="text-sm font-semibold text-ink">Oferta recomendada</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {lead.recommendedOffer || "Analise comercial inicial da MD Marketing."}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-[#172147] bg-[#050814] p-4 text-white">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold">Mensagem inicial gerada</h3>
                <span className="text-xs text-[#8EA0FF]">copiar ou abrir no WhatsApp</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#E8ECFF]">
                {lead.message || "Mensagem ainda nao gerada para este lead."}
              </p>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
