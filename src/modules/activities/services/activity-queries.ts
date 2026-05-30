import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export type ActivitySummary = {
  description: string;
  id: string;
  occurredAt: string;
  title: string;
  type: string;
};

export async function getActivities(): Promise<ActivitySummary[]> {
  const supabase = createSupabaseAdminClient();
  const organization = await getDefaultOrganization();

  const { data, error } = await supabase
    .from("activities")
    .select("id, type, title, description, occurred_at")
    .eq("organization_id", organization.id)
    .order("occurred_at", { ascending: false })
    .limit(80);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((activity) => ({
    description: text(activity.description),
    id: text(activity.id),
    occurredAt: text(activity.occurred_at),
    title: text(activity.title),
    type: text(activity.type)
  }));
}
