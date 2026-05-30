import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export type CopilotLeadOption = {
  companyName: string;
  contactName: string;
  id: string;
  phone: string;
  status: string;
};

export type CopilotDraft = {
  contactId: string;
  companyName: string;
  createdAt: string;
  id: string;
  leadId: string;
  message: string;
  objective: string;
  phone: string;
  whatsappUrl: string;
};

export type CopilotHistoryEvent = {
  companyName: string;
  content: string;
  createdAt: string;
  direction: string;
  id: string;
  status: string;
};

export async function getCopilotData() {
  const supabase = createSupabaseAdminClient();
  const organization = await getDefaultOrganization();

  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("id, company_id, primary_contact_id, status, created_at")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false })
    .limit(80);

  if (leadsError) {
    throw new Error(leadsError.message);
  }

  const leadIds = (leads ?? []).map((lead) => text(lead.id)).filter(Boolean);
  const companyIds = (leads ?? []).map((lead) => text(lead.company_id)).filter(Boolean);
  const contactIds = (leads ?? []).map((lead) => text(lead.primary_contact_id)).filter(Boolean);

  const [companies, contacts, drafts, events] = await Promise.all([
    companyIds.length
      ? supabase.from("companies").select("id, name").in("id", companyIds)
      : Promise.resolve({ data: [], error: null }),
    contactIds.length
      ? supabase.from("contacts").select("id, name, phone, whatsapp").in("id", contactIds)
      : Promise.resolve({ data: [], error: null }),
    leadIds.length
      ? supabase
          .from("generated_messages")
          .select("id, lead_id, contact_id, objective, message, created_at")
          .eq("organization_id", organization.id)
          .in("lead_id", leadIds)
          .in("objective", ["resposta_whatsapp", "follow_up_whatsapp", "reuniao_whatsapp"])
          .order("created_at", { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [], error: null }),
    leadIds.length
      ? supabase
          .from("message_events")
          .select("id, lead_id, direction, content, status, created_at")
          .eq("organization_id", organization.id)
          .in("lead_id", leadIds)
          .order("created_at", { ascending: false })
          .limit(30)
      : Promise.resolve({ data: [], error: null })
  ]);

  if (companies.error) {
    throw new Error(companies.error.message);
  }

  if (contacts.error) {
    throw new Error(contacts.error.message);
  }

  if (drafts.error) {
    throw new Error(drafts.error.message);
  }

  if (events.error) {
    throw new Error(events.error.message);
  }

  const companyById = new Map((companies.data ?? []).map((company) => [text(company.id), text(company.name)]));
  const contactById = new Map((contacts.data ?? []).map((contact) => [text(contact.id), contact]));
  const leadById = new Map((leads ?? []).map((lead) => [text(lead.id), lead]));

  return {
    drafts: (drafts.data ?? []).map((draft) => {
      const lead = leadById.get(text(draft.lead_id));
      const contactId = text(draft.contact_id) || text(lead?.primary_contact_id);
      const contact = contactById.get(contactId);
      const phone = text(contact?.whatsapp) || text(contact?.phone);
      const message = text(draft.message);

      return {
        contactId,
        companyName: companyById.get(text(lead?.company_id)) ?? "Empresa sem nome",
        createdAt: text(draft.created_at),
        id: text(draft.id),
        leadId: text(draft.lead_id),
        message,
        objective: text(draft.objective),
        phone,
        whatsappUrl: phone && message ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : ""
      } satisfies CopilotDraft;
    }),
    history: (events.data ?? []).map((event) => {
      const lead = leadById.get(text(event.lead_id));

      return {
        companyName: companyById.get(text(lead?.company_id)) ?? "Empresa sem nome",
        content: text(event.content),
        createdAt: text(event.created_at),
        direction: text(event.direction),
        id: text(event.id),
        status: text(event.status)
      } satisfies CopilotHistoryEvent;
    }),
    leads: (leads ?? []).map((lead) => ({
      companyName: companyById.get(text(lead.company_id)) ?? "Empresa sem nome",
      contactName: text(contactById.get(text(lead.primary_contact_id))?.name),
      id: text(lead.id),
      phone:
        text(contactById.get(text(lead.primary_contact_id))?.whatsapp) ||
        text(contactById.get(text(lead.primary_contact_id))?.phone),
      status: text(lead.status)
    })) satisfies CopilotLeadOption[]
  };
}
