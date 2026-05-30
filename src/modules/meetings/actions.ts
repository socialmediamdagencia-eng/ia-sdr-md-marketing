"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";

function formText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formNumber(formData: FormData, key: string): number {
  const value = Number(formText(formData, key));
  return Number.isFinite(value) ? value : 0;
}

export async function createMeetingAction(formData: FormData) {
  const leadId = formText(formData, "lead_id");
  const startsAtValue = formText(formData, "starts_at");
  const duration = Math.max(15, Math.min(180, formNumber(formData, "duration_minutes") || 45));

  if (!leadId || !startsAtValue) {
    throw new Error("Selecione o lead e o horario da reuniao.");
  }

  const startsAt = new Date(startsAtValue);
  const endsAt = new Date(startsAt.getTime() + duration * 60 * 1000);
  const organization = await getDefaultOrganization();
  const supabase = createSupabaseAdminClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, company_id, primary_contact_id")
    .eq("organization_id", organization.id)
    .eq("id", leadId)
    .single();

  if (leadError) {
    throw new Error(leadError.message);
  }

  const title = formText(formData, "title") || "Reuniao comercial MD Marketing";
  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .insert({
      organization_id: organization.id,
      lead_id: leadId,
      company_id: lead.company_id,
      contact_id: lead.primary_contact_id,
      title,
      description: formText(formData, "description"),
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      location: formText(formData, "location"),
      meeting_url: formText(formData, "meeting_url")
    })
    .select("id")
    .single();

  if (meetingError) {
    throw new Error(meetingError.message);
  }

  await Promise.all([
    supabase
      .from("leads")
      .update({
        next_follow_up_at: startsAt.toISOString(),
        status: "meeting_scheduled"
      })
      .eq("organization_id", organization.id)
      .eq("id", leadId),
    supabase.from("activities").insert({
      organization_id: organization.id,
      lead_id: leadId,
      company_id: lead.company_id,
      contact_id: lead.primary_contact_id,
      meeting_id: meeting.id,
      type: "meeting_scheduled",
      title: "Reuniao marcada",
      description: `${title} agendada pela IA SDR.`
    })
  ]);

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/pipeline");
  revalidatePath("/reunioes");
  revalidatePath("/leads");
}
