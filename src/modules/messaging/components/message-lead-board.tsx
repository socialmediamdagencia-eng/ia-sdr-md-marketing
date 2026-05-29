import type { MessageLeadCard } from "@/modules/messaging/services/message-queries";

const temperatureLabels: Record<string, string> = {
  cold: "Frio",
  warm: "Morno",
  hot: "Quente"
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
              {lead.whatsappUrl ? (
                <a
                  className="inline-flex w-fit items-center justify-center rounded-md bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal/90"
                  href={lead.whatsappUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Abrir WhatsApp
                </a>
              ) : (
                <span className="w-fit rounded-md border border-line px-3 py-2 text-sm text-slate-500">
                  Sem WhatsApp
                </span>
              )}
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
