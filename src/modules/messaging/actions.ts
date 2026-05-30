"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";
import { buildCommercialAnalysis } from "@/modules/prospecting/services/commercial-analysis";

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function regenerateLeadAiAction(formData: FormData) {
  const leadId = formText(formData, "lead_id");

  if (!leadId) {
    throw new Error("Lead nao informado.");
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

  const [{ data: company, error: companyError }, { data: contact, error: contactError }] =
    await Promise.all([
      supabase
        .from("companies")
        .select("id, name, segment, city, phone, instagram_url, website_url, description")
        .eq("organization_id", organization.id)
        .eq("id", text(lead.company_id))
        .single(),
      text(lead.primary_contact_id)
        ? supabase
            .from("contacts")
            .select("id, name, phone, whatsapp, role")
            .eq("organization_id", organization.id)
            .eq("id", text(lead.primary_contact_id))
            .maybeSingle()
        : Promise.resolve({ data: null, error: null })
    ]);

  if (companyError) {
    throw new Error(companyError.message);
  }

  if (contactError) {
    throw new Error(contactError.message);
  }

  const phone = text(contact?.whatsapp) || text(contact?.phone) || text(company.phone);
  const analysis = await buildCommercialAnalysis({
    city: text(company.city),
    contactName: text(contact?.name),
    description: text(company.description),
    hasInstagram: Boolean(company.instagram_url),
    hasPhone: Boolean(phone),
    instagramUrl: text(company.instagram_url),
    name: text(company.name),
    segment: text(company.segment),
    websiteUrl: text(company.website_url)
  });

  await Promise.all([
    supabase
      .from("leads")
      .update({
        temperature: analysis.temperature
      })
      .eq("organization_id", organization.id)
      .eq("id", leadId),
    supabase.from("lead_scores").insert({
      organization_id: organization.id,
      lead_id: leadId,
      score: analysis.score,
      temperature: analysis.temperature,
      fit_score: analysis.fitScore,
      urgency_score: analysis.urgencyScore,
      digital_presence_score: analysis.digitalPresenceScore,
      contactability_score: analysis.contactabilityScore,
      opportunity_score: analysis.opportunityScore,
      reasoning: analysis.reasoning,
      generated_by: analysis.generatedBy
    }),
    supabase.from("lead_insights").insert({
      organization_id: organization.id,
      lead_id: leadId,
      possible_pains: analysis.possiblePains,
      opportunities: analysis.opportunities,
      recommended_offer: analysis.recommendedOffer,
      objections: analysis.objections,
      buying_signals: analysis.buyingSignals,
      ai_summary: analysis.summary
    }),
    supabase.from("generated_messages").insert({
      organization_id: organization.id,
      lead_id: leadId,
      contact_id: text(contact?.id) || null,
      channel: "whatsapp",
      objective: "primeira_abordagem",
      tone: "consultivo",
      message: analysis.message,
      status: "draft",
      generated_by: analysis.generatedBy
    }),
    supabase.from("activities").insert({
      organization_id: organization.id,
      lead_id: leadId,
      company_id: lead.company_id,
      contact_id: text(contact?.id) || null,
      type: "lead_ai_regenerated",
      title: "Analise de IA atualizada",
      description: `Score, dores, oportunidades e mensagem atualizados para ${text(company.name)}.`
    })
  ]);

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/mensagens");
  revalidatePath("/leads");
  revalidatePath("/pipeline");
}
