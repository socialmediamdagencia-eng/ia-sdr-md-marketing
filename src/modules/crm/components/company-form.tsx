import { createCompanyAction } from "@/modules/crm/actions";

export function CompanyForm() {
  return (
    <form action={createCompanyAction} className="rounded-md border border-line bg-white p-5">
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">CRM</p>
        <h2 className="mt-1 text-lg font-semibold text-ink">Nova empresa</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Empresa</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            name="name"
            placeholder="Ex: Clinica Alfa"
            required
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Segmento</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            name="segment"
            placeholder="Ex: Clinica odontologica"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Cidade</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            name="city"
            placeholder="Ex: Sao Paulo"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Estado</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            name="state"
            placeholder="Ex: SP"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Telefone</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            name="phone"
            placeholder="Ex: 11999999999"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Instagram</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            name="instagram_url"
            placeholder="https://instagram.com/empresa"
          />
        </label>
        <label className="space-y-1 text-sm xl:col-span-2">
          <span className="font-medium text-ink">Site</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            name="website_url"
            placeholder="https://empresa.com.br"
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          className="rounded-md bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal/90"
          type="submit"
        >
          Salvar empresa
        </button>
      </div>
    </form>
  );
}
