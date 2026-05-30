import { CommercialSettingsForm } from "@/modules/settings/components/commercial-settings-form";
import { getCommercialSettings } from "@/modules/settings/services/settings-queries";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getCommercialSettings();

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

      <CommercialSettingsForm settings={settings} />
    </section>
  );
}
