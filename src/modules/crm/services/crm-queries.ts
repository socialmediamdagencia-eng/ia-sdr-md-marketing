import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";
import type { CompanySummary, LeadSummary } from "@/modules/crm/types";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

export async function getCompanies(): Promise<CompanySummary[]> {
  const supabase = createSupabaseAdminClient();
  const organization = await getDefaultOrganization();

  const { data, error } = await supabase
    .from("companies")
    .select(
      "id, name, segment, city, state, phone, instagram_url, website_url, data_confidence, created_at"
    )
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((company) => ({
    id: text(company.id),
    name: text(company.name),
    segment: text(company.segment),
    city: text(company.city),
    state: text(company.state),
    phone: text(company.phone),
    instagramUrl: text(company.instagram_url),
    websiteUrl: text(company.website_url),
    dataConfidence: numberValue(company.data_confidence),
    createdAt: text(company.created_at)
  }));
}

export async function getLeads(): Promise<LeadSummary[]> {
  const supabase = createSupabaseAdminClient();
  const organization = await getDefaultOrganization();

  const [{ data: leads, error: leadsError }, { data: companies, error: companiesError }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("id, company_id, status, temperature, origin, next_follow_up_at, created_at")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false }),
      supabase.from("companies").select("id, name").eq("organization_id", organization.id)
    ]);

  if (leadsError) {
    throw new Error(leadsError.message);
  }

  if (companiesError) {
    throw new Error(companiesError.message);
  }

  const companyNames = new Map(
    (companies ?? []).map((company) => [text(company.id), text(company.name)])
  );

  return (leads ?? []).map((lead) => ({
    id: text(lead.id),
    companyId: text(lead.company_id),
    companyName: companyNames.get(text(lead.company_id)) ?? "Empresa sem nome",
    status: text(lead.status),
    temperature: text(lead.temperature),
    origin: text(lead.origin),
    nextFollowUpAt: text(lead.next_follow_up_at),
    createdAt: text(lead.created_at)
  }));
}

export async function getCrmCounts() {
  const supabase = createSupabaseAdminClient();
  const organization = await getDefaultOrganization();

  const [companies, leads, activities] = await Promise.all([
    supabase
      .from("companies")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id),
    supabase
      .from("activities")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
  ]);

  return {
    companies: companies.count ?? 0,
    leads: leads.count ?? 0,
    activities: activities.count ?? 0
  };
}
