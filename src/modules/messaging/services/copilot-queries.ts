import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export type CopilotLeadOption = {
  companyName: string;
  id: string;
  status: string;
};

export type CopilotDraft = {
  companyName: string;
  createdAt: string;
  id: string;
  message: string;
  objective: string;
};

export async function getCopilotData() {
  const supabase = createSupabaseAdminClient();
  const organization = await getDefaultOrganization();

  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("id, company_id, status, created_at")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false })
    .limit(80);

  if (leadsError) {
    throw new Error(leadsError.message);
  }

  const leadIds = (leads ?? []).map((lead) => text(lead.id)).filter(Boolean);
  const companyIds = (leads ?? []).map((lead) => text(lead.company_id)).filter(Boolean);

  const [companies, drafts] = await Promise.all([
    companyIds.length
      ? supabase.from("companies").select("id, name").in("id", companyIds)
      : Promise.resolve({ data: [], error: null }),
    leadIds.length
      ? supabase
          .from("generated_messages")
          .select("id, lead_id, objective, message, created_at")
          .eq("organization_id", organization.id)
          .in("lead_id", leadIds)
          .in("objective", ["resposta_whatsapp", "follow_up_whatsapp", "reuniao_whatsapp"])
          .order("created_at", { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [], error: null })
  ]);

  if (companies.error) {
    throw new Error(companies.error.message);
  }

  if (drafts.error) {
    throw new Error(drafts.error.message);
  }

  const companyById = new Map((companies.data ?? []).map((company) => [text(company.id), text(company.name)]));
  const leadById = new Map((leads ?? []).map((lead) => [text(lead.id), lead]));

  return {
    drafts: (drafts.data ?? []).map((draft) => {
      const lead = leadById.get(text(draft.lead_id));

      return {
        companyName: companyById.get(text(lead?.company_id)) ?? "Empresa sem nome",
        createdAt: text(draft.created_at),
        id: text(draft.id),
        message: text(draft.message),
        objective: text(draft.objective)
      } satisfies CopilotDraft;
    }),
    leads: (leads ?? []).map((lead) => ({
      companyName: companyById.get(text(lead.company_id)) ?? "Empresa sem nome",
      id: text(lead.id),
      status: text(lead.status)
    })) satisfies CopilotLeadOption[]
  };
}
