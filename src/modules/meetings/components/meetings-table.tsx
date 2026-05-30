import type { MeetingSummary } from "@/modules/meetings/services/meeting-queries";

const statusLabels: Record<string, string> = {
  canceled: "Cancelada",
  completed: "Realizada",
  no_show: "Não compareceu",
  scheduled: "Agendada"
};

function formatDate(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo"
  }).format(new Date(value));
}

export function MeetingsTable({ meetings }: { meetings: MeetingSummary[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-white">
      <div className="border-b border-line p-5">
        <h2 className="text-lg font-semibold text-ink">Reuniões agendadas</h2>
        <p className="mt-1 text-sm text-slate-600">{meetings.length} reuniões no calendário comercial.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Reunião</th>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">Contato</th>
              <th className="px-4 py-3 font-medium">Início</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {meetings.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                  Nenhuma reunião marcada ainda.
                </td>
              </tr>
            ) : (
              meetings.map((meeting) => (
                <tr key={meeting.id}>
                  <td className="px-4 py-3 font-medium text-ink">{meeting.title}</td>
                  <td className="px-4 py-3 text-slate-600">{meeting.companyName}</td>
                  <td className="px-4 py-3 text-slate-600">{meeting.contactName || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(meeting.startsAt)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {statusLabels[meeting.status] ?? meeting.status}
                  </td>
                  <td className="px-4 py-3">
                    {meeting.meetingUrl ? (
                      <a className="text-teal underline-offset-4 hover:underline" href={meeting.meetingUrl}>
                        Abrir
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
