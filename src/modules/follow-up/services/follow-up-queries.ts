import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export type FollowUpTask = {
  companyName: string;
  description: string;
  dueAt: string;
  id: string;
  leadId: string;
  priority: string;
  status: string;
  title: string;
};

export async function getFollowUpTasks(): Promise<FollowUpTask[]> {
  const supabase = createSupabaseAdminClient();
  const organization = await getDefaultOrganization();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id, lead_id, company_id, title, description, status, priority, due_at, created_at")
    .eq("organization_id", organization.id)
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const companyIds = (tasks ?? []).map((task) => text(task.company_id)).filter(Boolean);
  const { data: companies, error: companiesError } = companyIds.length
    ? await supabase.from("companies").select("id, name").in("id", companyIds)
    : { data: [], error: null };

  if (companiesError) {
    throw new Error(companiesError.message);
  }

  const companyById = new Map((companies ?? []).map((company) => [text(company.id), text(company.name)]));

  return (tasks ?? []).map((task) => ({
    companyName: companyById.get(text(task.company_id)) ?? "Empresa sem nome",
    description: text(task.description),
    dueAt: text(task.due_at),
    id: text(task.id),
    leadId: text(task.lead_id),
    priority: text(task.priority),
    status: text(task.status),
    title: text(task.title)
  }));
}
