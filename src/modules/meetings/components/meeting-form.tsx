import { createMeetingAction } from "@/modules/meetings/actions";
import type { LeadSummary } from "@/modules/crm/types";

export function MeetingForm({ leads }: { leads: LeadSummary[] }) {
  return (
    <form action={createMeetingAction} className="rounded-md border border-line bg-white p-5">
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Agenda</p>
        <h2 className="mt-1 text-lg font-semibold text-ink">Nova reunião</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <label className="space-y-1 text-sm lg:col-span-2">
          <span className="font-medium text-ink">Lead</span>
          <select
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-teal"
            name="lead_id"
            required
          >
            <option value="">Selecione um lead</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.companyName}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Data e horário</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            name="starts_at"
            required
            type="datetime-local"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Duração</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            defaultValue={45}
            max={180}
            min={15}
            name="duration_minutes"
            type="number"
          />
        </label>
        <label className="space-y-1 text-sm lg:col-span-2">
          <span className="font-medium text-ink">Título</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            name="title"
            placeholder="Reunião comercial MD Marketing"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Local</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            name="location"
            placeholder="Google Meet, presencial..."
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-ink">Link</span>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
            name="meeting_url"
            placeholder="https://meet.google.com/..."
          />
        </label>
        <label className="space-y-1 text-sm lg:col-span-4">
          <span className="font-medium text-ink">Observações</span>
          <textarea
            className="min-h-20 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-teal"
            name="description"
            placeholder="Contexto da conversa, dor do cliente e objetivo da reunião."
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          className="rounded-md bg-teal px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={leads.length === 0}
          type="submit"
        >
          Agendar reunião
        </button>
      </div>
    </form>
  );
}
