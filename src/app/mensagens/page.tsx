import { MessageLeadBoard } from "@/modules/messaging/components/message-lead-board";
import { getMessageLeadCards } from "@/modules/messaging/services/message-queries";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const leads = await getMessageLeadCards();

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-medium text-teal">Mensagens</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Abordagens IA SDR</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Mensagens prontas para WhatsApp com base no playbook da MD Marketing, score
          comercial, dores provaveis e oportunidades por lead.
        </p>
      </div>

      <MessageLeadBoard leads={leads} />
    </section>
  );
}
