"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function completeTaskAction(formData: FormData) {
  const taskId = formText(formData, "task_id");

  if (!taskId) {
    throw new Error("Tarefa nao encontrada.");
  }

  const supabase = createSupabaseAdminClient();
  const organization = await getDefaultOrganization();

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id, lead_id, company_id, contact_id, title")
    .eq("organization_id", organization.id)
    .eq("id", taskId)
    .single();

  if (taskError) {
    throw new Error(taskError.message);
  }

  const completedAt = new Date().toISOString();

  await Promise.all([
    supabase
      .from("tasks")
      .update({
        completed_at: completedAt,
        status: "completed"
      })
      .eq("organization_id", organization.id)
      .eq("id", taskId),
    supabase.from("activities").insert({
      organization_id: organization.id,
      lead_id: task.lead_id,
      company_id: task.company_id,
      contact_id: task.contact_id,
      type: "follow_up_completed",
      title: "Follow-up concluido",
      description: task.title,
      metadata: {
        task_id: taskId
      }
    })
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/follow-up");
  revalidatePath("/atividades");
}
