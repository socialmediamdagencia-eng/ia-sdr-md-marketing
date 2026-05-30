"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";
import { analyzeConversation } from "@/modules/messaging/services/conversation-copilot";

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export async function analyzeConversationAction(formData: FormData) {
  const leadId = formText(formData, "lead_id");
  const conversation = formText(formData, "conversation");
  const objective = formText(formData, "objective") || "responder";

  if (!leadId || !conversation) {
    throw new Error("Selecione um lead e cole a conversa.");
  }

  const supabase = createSupabaseAdminClient();
  const organization = await getDefaultOrganization();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, company_id, primary_contact_id")
    .eq("organization_id", organization.id)
    .eq("id", leadId)
    .single();

  if (leadError) {
    throw new Error(leadError.message);
  }

  const [{ data: company, error: companyError }, { data: insight, error: insightError }] =
    await Promise.all([
      supabase
        .from("companies")
        .select("id, name")
        .eq("organization_id", organization.id)
        .eq("id", text(lead.company_id))
        .single(),
      supabase
        .from("lead_insights")
        .select("possible_pains, recommended_offer")
        .eq("organization_id", organization.id)
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);

  if (companyError) {
    throw new Error(companyError.message);
  }

  if (insightError) {
    throw new Error(insightError.message);
  }

  const result = await analyzeConversation({
    companyName: text(company.name),
    conversation,
    objective,
    pains: stringArray(insight?.possible_pains),
    recommendedOffer: text(insight?.recommended_offer)
  });

  const nextFollowUp = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await Promise.all([
    supabase
      .from("leads")
      .update({
        next_follow_up_at: nextFollowUp,
        status: result.leadStatus
      })
      .eq("organization_id", organization.id)
      .eq("id", leadId),
    supabase.from("message_events").insert({
      organization_id: organization.id,
      lead_id: leadId,
      contact_id: text(lead.primary_contact_id) || null,
      channel: "whatsapp",
      direction: "inbound",
      content: conversation,
      status: "replied",
      received_at: new Date().toISOString(),
      metadata: {
        objective,
        summary: result.summary
      }
    }),
    supabase.from("generated_messages").insert({
      organization_id: organization.id,
      lead_id: leadId,
      contact_id: text(lead.primary_contact_id) || null,
      channel: "whatsapp",
      objective:
        result.leadStatus === "meeting_scheduled" ? "reuniao_whatsapp" : "resposta_whatsapp",
      tone: "consultivo",
      message: result.reply,
      status: "draft",
      generated_by: "copiloto_whatsapp_gratis"
    }),
    supabase.from("tasks").insert({
      organization_id: organization.id,
      lead_id: leadId,
      company_id: text(lead.company_id),
      contact_id: text(lead.primary_contact_id) || null,
      title: result.nextAction,
      description: result.summary,
      type: "follow_up",
      status: "pending",
      priority: result.leadStatus === "meeting_scheduled" ? "high" : "medium",
      due_at: nextFollowUp
    }),
    supabase.from("activities").insert({
      organization_id: organization.id,
      lead_id: leadId,
      company_id: text(lead.company_id),
      contact_id: text(lead.primary_contact_id) || null,
      type: "conversation_analyzed",
      title: "Conversa analisada pelo Copiloto WhatsApp",
      description: result.summary,
      metadata: {
        next_action: result.nextAction
      }
    })
  ]);

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/mensagens");
  revalidatePath("/copiloto");
  revalidatePath("/pipeline");
  revalidatePath("/follow-up");
}
