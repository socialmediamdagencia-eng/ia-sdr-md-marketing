import { ProspectingWorkspace } from "@/modules/prospecting/components/prospecting-workspace";

export const dynamic = "force-dynamic";

export default function ProspectingPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-medium text-teal">Prospecção</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Motor de prospeccao IA SDR</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Busque empresas reais por segmento e cidade. A IA SDR salva empresas, contatos,
          leads, score, oportunidades e mensagens sem derrubar a tela se a busca falhar.
        </p>
      </div>

      <ProspectingWorkspace />
    </section>
  );
}
