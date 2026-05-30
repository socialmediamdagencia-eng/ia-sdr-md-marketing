import { saveCommercialSettingsAction } from "@/modules/settings/actions";
import type { CommercialSettings } from "@/modules/settings/services/settings-queries";

export function CommercialSettingsForm({ settings }: { settings: CommercialSettings }) {
  return (
    <form action={saveCommercialSettingsAction} className="rounded-md border border-line bg-white p-5">
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Base da IA</p>
        <h2 className="mt-1 text-lg font-semibold text-ink">Configurações comerciais</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Essas informações orientam score, mensagem, oferta recomendada e próximos passos.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Nome comercial</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            defaultValue={settings.tradeName}
            name="trade_name"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Nome usado pela IA</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            defaultValue={settings.brandName}
            name="brand_name"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Segmento da MD</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            defaultValue={settings.segment}
            name="segment"
            placeholder="Marketing, vendas e CRM"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Cidade base</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            defaultValue={settings.city}
            name="city"
            placeholder="Ex: Maringa"
          />
        </label>
        <label className="space-y-1 text-sm lg:col-span-2">
          <span className="font-medium text-ink">Site</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            defaultValue={settings.website}
            name="website"
            placeholder="https://..."
          />
        </label>
        <label className="space-y-1 text-sm lg:col-span-2">
          <span className="font-medium text-ink">Descrição comercial</span>
          <textarea
            className="min-h-24 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-teal"
            defaultValue={settings.businessDescription}
            name="business_description"
          />
        </label>
        <label className="space-y-1 text-sm lg:col-span-2">
          <span className="font-medium text-ink">Público-alvo</span>
          <textarea
            className="min-h-20 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-teal"
            defaultValue={settings.targetAudience}
            name="target_audience"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Ofertas principais</span>
          <textarea
            className="min-h-36 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-teal"
            defaultValue={settings.mainOffers.join("\n")}
            name="main_offers"
            placeholder={"Gestão de tráfego\nCRM comercial\nConteúdo e posicionamento"}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Critérios de qualificação</span>
          <textarea
            className="min-h-36 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-teal"
            defaultValue={settings.qualificationCriteria.join("\n")}
            name="qualification_criteria"
            placeholder={"Tem demanda comercial\nPrecisa gerar leads\nTem ticket compatível"}
          />
        </label>
        <label className="space-y-1 text-sm lg:col-span-2">
          <span className="font-medium text-ink">Tom de voz</span>
          <select
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-teal"
            defaultValue={settings.toneOfVoice}
            name="tone_of_voice"
          >
            <option value="consultivo">Consultivo</option>
            <option value="direto">Direto</option>
            <option value="premium">Premium</option>
            <option value="provocativo">Provocativo</option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <button className="rounded-md bg-teal px-4 py-2 text-sm font-semibold text-white" type="submit">
          Salvar configurações
        </button>
      </div>
    </form>
  );
}
