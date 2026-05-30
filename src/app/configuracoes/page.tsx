import { CommercialSettingsForm } from "@/modules/settings/components/commercial-settings-form";
import { getCommercialSettings } from "@/modules/settings/services/settings-queries";
import { isAiConfigured } from "@/lib/ai/openrouter";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getCommercialSettings();
  const aiConfigured = isAiConfigured();

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-medium text-teal">Core</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Configurações</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Base comercial da MD Marketing para guiar prospecção, score, mensagens,
          follow-up, reuniões e diagnóstico dos leads.
        </p>
      </div>

      <div className="rounded-md border border-line bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Inteligência artificial
            </p>
            <h2 className="mt-1 text-lg font-semibold text-ink">OpenRouter</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {aiConfigured
                ? `IA ativa usando o modelo ${env.openRouterModel}.`
                : "IA ainda sem chave. O sistema continua funcionando com regras locais até configurar OPENROUTER_API_KEY na Vercel."}
            </p>
          </div>
          <span
            className={`w-fit rounded-md border px-3 py-1 text-xs font-medium ${
              aiConfigured
                ? "border-teal/20 bg-teal/10 text-teal"
                : "border-amber/20 bg-amber/10 text-amber"
            }`}
          >
            {aiConfigured ? "IA conectada" : "Aguardando chave"}
          </span>
        </div>
      </div>

      <CommercialSettingsForm settings={settings} />
    </section>
  );
}
