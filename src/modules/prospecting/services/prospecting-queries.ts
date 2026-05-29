import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

export type ProspectingCampaignSummary = {
  id: string;
  city: string;
  createdAt: string;
  errorMessage: string;
  foundQuantity: number;
  name: string;
  requestedQuantity: number;
  segment: string;
  status: string;
};

export async function getProspectingCampaigns(): Promise<ProspectingCampaignSummary[]> {
  const supabase = createSupabaseAdminClient();
  const organization = await getDefaultOrganization();

  const { data, error } = await supabase
    .from("prospecting_campaigns")
    .select(
      "id, name, segment, city, requested_quantity, found_quantity, status, error_message, created_at"
    )
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((campaign) => ({
    id: text(campaign.id),
    city: text(campaign.city),
    createdAt: text(campaign.created_at),
    errorMessage: text(campaign.error_message),
    foundQuantity: numberValue(campaign.found_quantity),
    name: text(campaign.name),
    requestedQuantity: numberValue(campaign.requested_quantity),
    segment: text(campaign.segment),
    status: text(campaign.status)
  }));
}
