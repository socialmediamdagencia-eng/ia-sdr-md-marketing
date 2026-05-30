type LeadStatusCounts = {
  new: number;
  qualified: number;
  contacted: number;
  replied: number;
  meeting_scheduled: number;
  proposal_sent: number;
  won: number;
  lost: number;
  archived: number;
};

type LeadTemperatureCounts = {
  cold: number;
  warm: number;
  hot: number;
};

type CommercialChartsProps = {
  activities: number;
  campaigns: number;
  companies: number;
  foundProspects: number;
  latestCampaign: {
    city: string;
    foundQuantity: number;
    name: string;
    requestedQuantity: number;
    segment: string;
    status: string;
  } | null;
  leads: number;
  requestedProspects: number;
  statusCounts: LeadStatusCounts;
  temperatureCounts: LeadTemperatureCounts;
};

function percent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.max(4, Math.min(100, Math.round((value / total) * 100)));
}

function displayPercent(value: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
}

export function CommercialCharts({
  activities,
  campaigns,
  companies,
  foundProspects,
  latestCampaign,
  leads,
  requestedProspects,
  statusCounts,
  temperatureCounts
}: CommercialChartsProps) {
  const prospected = Math.max(foundProspects, companies);
  const contacted =
    statusCounts.contacted +
    statusCounts.replied +
    statusCounts.meeting_scheduled +
    statusCounts.proposal_sent +
    statusCounts.won +
    statusCounts.lost;
  const inConversation =
    statusCounts.replied +
    statusCounts.meeting_scheduled +
    statusCounts.proposal_sent +
    statusCounts.won;
  const meetings = statusCounts.meeting_scheduled + statusCounts.proposal_sent + statusCounts.won;
  const proposals = statusCounts.proposal_sent + statusCounts.won;
  const won = statusCounts.won;
  const lost = statusCounts.lost + statusCounts.archived;
  const open = Math.max(0, leads - won - lost);
  const maxFunnel = Math.max(prospected, leads, contacted, inConversation, meetings, proposals, won, 1);
  const latestCoverage = latestCampaign
    ? displayPercent(latestCampaign.foundQuantity, latestCampaign.requestedQuantity)
    : "0%";

  const funnel = [
    { label: "Prospectados", value: prospected, tone: "bg-[#4D6BFF]" },
    { label: "Leads criados", value: leads, tone: "bg-[#6F85FF]" },
    { label: "Abordados", value: contacted, tone: "bg-[#8EA0FF]" },
    { label: "Responderam", value: inConversation, tone: "bg-[#FFFFFF]" },
    { label: "Reunioes marcadas", value: meetings, tone: "bg-[#5A74FF]" },
    { label: "Propostas", value: proposals, tone: "bg-[#C8D2FF]" },
    { label: "Fechados", value: won, tone: "bg-[#FFFFFF]" }
  ];

  const statusCards = [
    { label: "Abertos", value: open, detail: displayPercent(open, leads), color: "text-white" },
    { label: "Fechados", value: won, detail: displayPercent(won, leads), color: "text-[#FFFFFF]" },
    { label: "Nao fechados", value: lost, detail: displayPercent(lost, leads), color: "text-[#D7DFFF]" },
    {
      label: "Taxa resposta",
      value: inConversation,
      detail: displayPercent(inConversation, Math.max(contacted, leads)),
      color: "text-[#8EA0FF]"
    }
  ];

  const lossReasons = [
    { label: "Sem resposta", value: 0, note: "aguardando classificacao" },
    { label: "Sem verba", value: 0, note: "aguardando classificacao" },
    { label: "Ja tem fornecedor", value: 0, note: "aguardando classificacao" },
    { label: "Nao e decisor", value: 0, note: "aguardando classificacao" }
  ];

  const channels = [
    { label: "WhatsApp", value: contacted, caption: "abordagens" },
    { label: "Instagram", value: 0, caption: "previsto V2" },
    { label: "Indicacao", value: 0, caption: "previsto V2" }
  ];

  return (
    <section className="rounded-md border border-[#172147] bg-[#050814] p-5 text-white shadow-soft">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7F97FF]">
            Dashboard comercial
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Central de controle IA SDR</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#C8D2FF]">
            Visao completa de prospeccao, conversao, perdas, motivos e foco comercial da MD
            Marketing.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[620px] xl:grid-cols-4">
          <div className="rounded-md border border-white/10 bg-white/[0.06] p-3">
            <p className="text-[11px] uppercase tracking-wide text-[#94A3B8]">Campanhas</p>
            <p className="mt-1 text-2xl font-semibold">{campaigns}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.06] p-3">
            <p className="text-[11px] uppercase tracking-wide text-[#94A3B8]">Solicitados</p>
            <p className="mt-1 text-2xl font-semibold">{requestedProspects}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.06] p-3">
            <p className="text-[11px] uppercase tracking-wide text-[#94A3B8]">Cobertura</p>
            <p className="mt-1 text-2xl font-semibold text-[#8EA0FF]">
              {displayPercent(prospected, Math.max(requestedProspects, prospected))}
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.06] p-3">
            <p className="text-[11px] uppercase tracking-wide text-[#94A3B8]">Atividades</p>
            <p className="mt-1 text-2xl font-semibold">{activities}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statusCards.map((card) => (
          <div key={card.label} className="rounded-md border border-white/10 bg-[#10182B] p-4">
            <p className="text-xs uppercase tracking-wide text-[#94A3B8]">{card.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className={`text-4xl font-semibold ${card.color}`}>{card.value}</p>
              <p className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-sm text-[#C8D2FF]">
                {card.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-md border border-white/10 bg-[#10182B] p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7F97FF]">
              Ultima campanha
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              {latestCampaign?.name ?? "Nenhuma campanha registrada ainda"}
            </h3>
            <p className="mt-1 text-sm text-[#C8D2FF]">
              {latestCampaign
                ? `${latestCampaign.segment} em ${latestCampaign.city}`
                : "Quando uma prospeccao rodar, ela aparece aqui separada do acumulado geral."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:w-[520px]">
            <div className="rounded-md border border-white/10 bg-white/[0.06] p-3">
              <p className="text-[11px] uppercase tracking-wide text-[#94A3B8]">Solicitados</p>
              <p className="mt-1 text-2xl font-semibold">
                {latestCampaign?.requestedQuantity ?? 0}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.06] p-3">
              <p className="text-[11px] uppercase tracking-wide text-[#94A3B8]">Encontrados</p>
              <p className="mt-1 text-2xl font-semibold text-[#8EA0FF]">
                {latestCampaign?.foundQuantity ?? 0}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.06] p-3">
              <p className="text-[11px] uppercase tracking-wide text-[#94A3B8]">Resultado</p>
              <p className="mt-1 text-2xl font-semibold text-[#FFFFFF]">{latestCoverage}</p>
            </div>
          </div>
        </div>
        {latestCampaign ? (
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#8EA0FF]"
              style={{
                width: `${percent(latestCampaign.foundQuantity, latestCampaign.requestedQuantity)}%`
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-md border border-white/10 bg-[#0B1020] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Funil SDR completo</p>
              <p className="mt-1 text-xs text-[#94A3B8]">do lead prospectado ate o fechamento</p>
            </div>
            <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-[#C8D2FF]">
              {displayPercent(won, leads)} fechamento
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {funnel.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-xs text-[#C8D2FF]">
                  <span>{item.label}</span>
                  <span>
                    {item.value} / {displayPercent(item.value, maxFunnel)}
                  </span>
                </div>
                <div className="h-8 overflow-hidden rounded-md bg-white/10">
                  <div
                    className={`flex h-full items-center justify-end rounded-md ${item.tone} px-3 text-xs font-semibold text-[#050814]`}
                    style={{ width: `${percent(item.value, maxFunnel)}%` }}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-md border border-white/10 bg-[#0B1020] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Temperatura dos leads</p>
              <span className="text-xs text-[#94A3B8]">qualidade</span>
            </div>
            <div className="mt-5 flex items-center gap-5">
              <div
                className="grid h-36 w-36 shrink-0 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(#FFFFFF ${displayPercent(
                    temperatureCounts.hot,
                    leads
                  )}, #8EA0FF 0 ${displayPercent(
                    temperatureCounts.hot + temperatureCounts.warm,
                    leads
                  )}, #1B2550 0)`
                }}
              >
                <div className="grid h-24 w-24 place-items-center rounded-full bg-[#050814]">
                  <span className="text-2xl font-semibold">{displayPercent(temperatureCounts.hot, leads)}</span>
                </div>
              </div>
              <div className="w-full space-y-3 text-sm">
                <div className="flex justify-between text-[#C8D2FF]">
                  <span>Quente</span>
                  <span>{temperatureCounts.hot}</span>
                </div>
                <div className="flex justify-between text-[#C8D2FF]">
                  <span>Morno</span>
                  <span>{temperatureCounts.warm}</span>
                </div>
                <div className="flex justify-between text-[#C8D2FF]">
                  <span>Frio</span>
                  <span>{temperatureCounts.cold}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-[#0B1020] p-5">
            <p className="text-sm font-semibold">Diagnostico rapido</p>
            <div className="mt-4 grid gap-3 text-sm text-[#C8D2FF]">
              <div className="rounded-md bg-white/[0.06] p-3">
                <span className="font-semibold text-white">Foco agora: </span>
                aumentar volume de empresas prospectadas e iniciar abordagens.
              </div>
              <div className="rounded-md bg-white/[0.06] p-3">
                <span className="font-semibold text-white">Risco: </span>
                poucos motivos de perda classificados para a IA aprender.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-[#0B1020] p-5">
          <p className="text-sm font-semibold">Motivos de nao fechamento</p>
          <div className="mt-4 space-y-3">
            {lossReasons.map((reason) => (
              <div key={reason.label}>
                <div className="mb-2 flex items-center justify-between text-xs text-[#C8D2FF]">
                  <span>{reason.label}</span>
                  <span>{reason.value}</span>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#8EA0FF]" style={{ width: "4%" }} />
                </div>
                <p className="mt-1 text-[11px] text-[#94A3B8]">{reason.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-white/10 bg-[#0B1020] p-5">
          <p className="text-sm font-semibold">Canais de abordagem</p>
          <div className="mt-4 space-y-4">
            {channels.map((channel) => (
              <div key={channel.label} className="rounded-md bg-white/[0.06] p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white">{channel.label}</p>
                  <p className="text-lg font-semibold text-[#8EA0FF]">{channel.value}</p>
                </div>
                <p className="mt-1 text-xs text-[#94A3B8]">{channel.caption}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-white/10 bg-[#0B1020] p-5">
          <p className="text-sm font-semibold">Plano de acao da IA</p>
          <div className="mt-4 space-y-3 text-sm text-[#C8D2FF]">
            <p className="rounded-md bg-white/[0.06] p-3">1. Prospectar empresas por nicho e cidade.</p>
            <p className="rounded-md bg-white/[0.06] p-3">2. Priorizar dono, socio ou responsavel de marketing.</p>
            <p className="rounded-md bg-white/[0.06] p-3">3. Gerar mensagem pelo playbook da MD.</p>
            <p className="rounded-md bg-white/[0.06] p-3">4. Classificar resposta, dor e motivo de perda.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
