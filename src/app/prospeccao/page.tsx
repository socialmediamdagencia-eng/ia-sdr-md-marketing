import { CampaignsTable } from "@/modules/prospecting/components/campaigns-table";
import { ProspectingForm } from "@/modules/prospecting/components/prospecting-form";
import {
  getProspectingCampaigns,
  type ProspectingCampaignSummary
} from "@/modules/prospecting/services/prospecting-queries";

export const dynamic = "force-dynamic";

export default async function ProspectingPage() {
  let campaigns: ProspectingCampaignSummary[] = [];
  let loadError = "";

  try {
    campaigns = await getProspectingCampaigns();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Nao foi possivel carregar as campanhas agora.";
  }

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-medium text-teal">Prospecção</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Motor de prospeccao IA SDR</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          A IA SDR busca dados publicos reais, cria empresas e contatos quando encontra
          informacoes aproveitaveis, prioriza decisores e gera score, dores provaveis
          e mensagens.
        </p>
      </div>

      <ProspectingForm />
      {loadError ? (
        <div className="rounded-md border border-coral/20 bg-coral/10 p-4 text-sm text-coral">
          A tela carregou, mas a lista de campanhas nao respondeu: {loadError}
        </div>
      ) : null}
      <CampaignsTable campaigns={campaigns} />
    </section>
  );
}
