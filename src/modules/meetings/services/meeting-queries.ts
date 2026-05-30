import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export type MeetingSummary = {
  companyName: string;
  contactName: string;
  description: string;
  endsAt: string;
  id: string;
  leadId: string;
  location: string;
  meetingUrl: string;
  startsAt: string;
  status: string;
  title: string;
};

export async function getMeetings(): Promise<MeetingSummary[]> {
  const supabase = createSupabaseAdminClient();
  const organization = await getDefaultOrganization();

  const { data: meetings, error } = await supabase
    .from("meetings")
    .select("id, lead_id, company_id, contact_id, title, description, status, starts_at, ends_at, location, meeting_url")
    .eq("organization_id", organization.id)
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const companyIds = (meetings ?? []).map((meeting) => text(meeting.company_id)).filter(Boolean);
  const contactIds = (meetings ?? []).map((meeting) => text(meeting.contact_id)).filter(Boolean);

  const [companies, contacts] = await Promise.all([
    companyIds.length
      ? supabase.from("companies").select("id, name").in("id", companyIds)
      : Promise.resolve({ data: [], error: null }),
    contactIds.length
      ? supabase.from("contacts").select("id, name").in("id", contactIds)
      : Promise.resolve({ data: [], error: null })
  ]);

  if (companies.error) {
    throw new Error(companies.error.message);
  }

  if (contacts.error) {
    throw new Error(contacts.error.message);
  }

  const companyById = new Map((companies.data ?? []).map((company) => [text(company.id), text(company.name)]));
  const contactById = new Map((contacts.data ?? []).map((contact) => [text(contact.id), text(contact.name)]));

  return (meetings ?? []).map((meeting) => ({
    companyName: companyById.get(text(meeting.company_id)) ?? "Empresa nao informada",
    contactName: contactById.get(text(meeting.contact_id)) ?? "",
    description: text(meeting.description),
    endsAt: text(meeting.ends_at),
    id: text(meeting.id),
    leadId: text(meeting.lead_id),
    location: text(meeting.location),
    meetingUrl: text(meeting.meeting_url),
    startsAt: text(meeting.starts_at),
    status: text(meeting.status),
    title: text(meeting.title)
  }));
}
