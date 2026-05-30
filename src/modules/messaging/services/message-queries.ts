import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export type MessageLeadCard = {
  companyName: string;
  contactId: string;
  contactName: string;
  id: string;
  message: string;
  messageId: string;
  opportunities: string[];
  pains: string[];
  phone: string;
  recommendedOffer: string;
  score: number;
  status: string;
  summary: string;
  temperature: string;
  whatsappUrl: string;
};

export async function getMessageLeadCards(): Promise<MessageLeadCard[]> {
  const supabase = createSupabaseAdminClient();
  const organization = await getDefaultOrganization();

  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("id, company_id, primary_contact_id, status, temperature, created_at")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (leadsError) {
    throw new Error(leadsError.message);
  }

  const leadIds = (leads ?? []).map((lead) => text(lead.id)).filter(Boolean);
  const companyIds = (leads ?? []).map((lead) => text(lead.company_id)).filter(Boolean);
  const contactIds = (leads ?? []).map((lead) => text(lead.primary_contact_id)).filter(Boolean);

  const [companies, contacts, scores, insights, messages] = await Promise.all([
    companyIds.length
      ? supabase.from("companies").select("id, name").in("id", companyIds)
      : Promise.resolve({ data: [], error: null }),
    contactIds.length
      ? supabase.from("contacts").select("id, name, phone, whatsapp").in("id", contactIds)
      : Promise.resolve({ data: [], error: null }),
    leadIds.length
      ? supabase
          .from("lead_scores")
          .select("lead_id, score")
          .in("lead_id", leadIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    leadIds.length
      ? supabase
          .from("lead_insights")
          .select("lead_id, possible_pains, opportunities, recommended_offer, ai_summary")
          .in("lead_id", leadIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    leadIds.length
      ? supabase
          .from("generated_messages")
          .select("id, lead_id, message")
          .eq("channel", "whatsapp")
          .in("lead_id", leadIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null })
  ]);

  for (const result of [companies, contacts, scores, insights, messages]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const companyById = new Map((companies.data ?? []).map((company) => [text(company.id), company]));
  const contactById = new Map((contacts.data ?? []).map((contact) => [text(contact.id), contact]));
  const scoreByLeadId = new Map<string, number>();
  const insightByLeadId = new Map<string, NonNullable<typeof insights.data>[number]>();
  const messageByLeadId = new Map<string, string>();
  const messageIdByLeadId = new Map<string, string>();

  for (const score of scores.data ?? []) {
    const leadId = text(score.lead_id);
    if (leadId && !scoreByLeadId.has(leadId)) {
      scoreByLeadId.set(leadId, numberValue(score.score));
    }
  }

  for (const insight of insights.data ?? []) {
    const leadId = text(insight.lead_id);
    if (leadId && !insightByLeadId.has(leadId)) {
      insightByLeadId.set(leadId, insight);
    }
  }

  for (const message of messages.data ?? []) {
    const leadId = text(message.lead_id);
    if (leadId && !messageByLeadId.has(leadId)) {
      messageByLeadId.set(leadId, text(message.message));
      messageIdByLeadId.set(leadId, text(message.id));
    }
  }

  return (leads ?? []).map((lead) => {
    const leadId = text(lead.id);
    const company = companyById.get(text(lead.company_id));
    const contact = contactById.get(text(lead.primary_contact_id));
    const insight = insightByLeadId.get(leadId);
    const phone = text(contact?.whatsapp) || text(contact?.phone);
    const message = messageByLeadId.get(leadId) ?? "";

    return {
      companyName: text(company?.name) || "Empresa sem nome",
      contactId: text(lead.primary_contact_id),
      contactName: text(contact?.name),
      id: leadId,
      message,
      messageId: messageIdByLeadId.get(leadId) ?? "",
      opportunities: stringArray(insight?.opportunities),
      pains: stringArray(insight?.possible_pains),
      phone,
      recommendedOffer: text(insight?.recommended_offer),
      score: scoreByLeadId.get(leadId) ?? 0,
      status: text(lead.status),
      summary: text(insight?.ai_summary),
      temperature: text(lead.temperature),
      whatsappUrl: phone && message ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : ""
    };
  });
}
