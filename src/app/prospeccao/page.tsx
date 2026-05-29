import { CampaignsTable } from "@/modules/prospecting/components/campaigns-table";
import { ProspectingForm } from "@/modules/prospecting/components/prospecting-form";
import { getProspectingCampaigns } from "@/modules/prospecting/services/prospecting-queries";

export const dynamic = "force-dynamic";

export default async function ProspectingPage() {
  const campaigns = await getProspectingCampaigns();

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
      <CampaignsTable campaigns={campaigns} />
    </section>
  );
}
