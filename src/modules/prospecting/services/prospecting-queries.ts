import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

type CampaignRow = {
  city?: unknown;
  created_at?: unknown;
  error_message?: unknown;
  found_quantity?: unknown;
  id?: unknown;
  name?: unknown;
  requested_quantity?: unknown;
  segment?: unknown;
  status?: unknown;
};

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

  const initial = await supabase
    .from("prospecting_campaigns")
    .select(
      "id, name, segment, city, requested_quantity, found_quantity, status, error_message, created_at"
    )
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false })
    .limit(12);
  let data: CampaignRow[] | null = initial.data as CampaignRow[] | null;
  let error = initial.error;

  if (error?.message.toLowerCase().includes("error_message")) {
    const retry = await supabase
      .from("prospecting_campaigns")
      .select("id, name, segment, city, requested_quantity, found_quantity, status, created_at")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .limit(12);

    data = retry.data as CampaignRow[] | null;
    error = retry.error;
  }

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
