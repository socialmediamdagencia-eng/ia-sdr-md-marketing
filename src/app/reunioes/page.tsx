import { getLeads } from "@/modules/crm/services/crm-queries";
import { MeetingForm } from "@/modules/meetings/components/meeting-form";
import { MeetingsTable } from "@/modules/meetings/components/meetings-table";
import { getMeetings } from "@/modules/meetings/services/meeting-queries";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const [leads, meetings] = await Promise.all([getLeads(), getMeetings()]);

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-medium text-teal">Reuniões</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Agenda comercial</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Marque reuniões a partir dos leads, atualize o funil automaticamente e mantenha
          histórico comercial no Supabase.
        </p>
      </div>

      <MeetingForm leads={leads} />
      <MeetingsTable meetings={meetings} />
    </section>
  );
}
