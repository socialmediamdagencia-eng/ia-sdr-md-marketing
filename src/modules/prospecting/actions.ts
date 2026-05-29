"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";
import { buildCommercialAnalysis } from "@/modules/prospecting/services/commercial-analysis";
import {
  searchPublicProspects,
  type PublicProspect
} from "@/modules/prospecting/services/public-search";

function formText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formNumber(formData: FormData, key: string): number {
  const value = Number(formText(formData, key));
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(1, Math.min(30, Math.round(value)));
}

function normalizeQuantity(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(1, Math.min(30, Math.round(value)));
}

function buildFallbackContactName(prospect: PublicProspect) {
  if (prospect.contactName) {
    return prospect.contactName;
  }

  return prospect.phone ? "Responsavel comercial" : "";
}

function isEnrichmentFallback(prospect: PublicProspect) {
  return prospect.description.toLowerCase().includes("modo contingencia");
}

function buildApproachMessage(input: {
  city: string;
  companyName: string;
  contactName: string;
}) {
  const greeting = input.contactName && input.contactName !== "Responsavel comercial"
    ? `Oi ${input.contactName}, tudo bem?`
    : "Oi, tudo bem?";

  return `${greeting} Vi a ${input.companyName} em ${input.city} e percebi uma oportunidade de melhorar a captacao de clientes pelo digital.

Sou da MD Marketing Empresarial. A gente ajuda empresas a transformar presenca digital em demanda e vendas, unindo conteudo, trafego e processo comercial.

Faz sentido eu te mostrar uma ideia rapida para aumentar os contatos qualificados da ${input.companyName}?`;
}

async function createProspectLead(input: {
  campaignId: string;
  organizationId: string;
  prospect: PublicProspect;
}) {
  const supabase = createSupabaseAdminClient();
  const contactName = buildFallbackContactName(input.prospect);

  const analysis = buildCommercialAnalysis({
    city: input.prospect.city,
    hasInstagram: Boolean(input.prospect.instagramUrl),
    hasPhone: Boolean(input.prospect.phone),
    name: input.prospect.name,
    segment: input.prospect.segment
  });

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      organization_id: input.organizationId,
      name: input.prospect.name,
      segment: input.prospect.segment,
      city: input.prospect.city,
      phone: input.prospect.phone,
      instagram_url: input.prospect.instagramUrl,
      website_url: input.prospect.websiteUrl,
      source: "public_web_search",
      data_confidence: input.prospect.confidence
    })
    .select("id")
    .single();

  if (companyError) {
    throw new Error(companyError.message);
  }

  const { data: contact, error: contactError } = await supabase
    .from("contacts")
    .insert({
      organization_id: input.organizationId,
      company_id: company.id,
      name: contactName,
      role: input.prospect.contactRole || "Responsavel comercial",
      phone: input.prospect.phone,
      whatsapp: input.prospect.phone,
      instagram_url: input.prospect.instagramUrl,
      is_primary: true,
      source: "public_web_search",
      data_confidence: input.prospect.contactName ? input.prospect.confidence : Math.max(35, input.prospect.confidence - 12)
    })
    .select("id")
    .single();

  if (contactError) {
    throw new Error(contactError.message);
  }

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      organization_id: input.organizationId,
      company_id: company.id,
      primary_contact_id: contact.id,
      status: input.prospect.phone ? "qualified" : "new",
      temperature: analysis.temperature,
      origin: "busca_publica_web",
      source_campaign_id: input.campaignId
    })
    .select("id")
    .single();

  if (leadError) {
    throw new Error(leadError.message);
  }

  const message = buildApproachMessage({
    city: input.prospect.city,
    companyName: input.prospect.name,
    contactName
  });

  await Promise.all([
    supabase.from("prospecting_results").insert({
      organization_id: input.organizationId,
      campaign_id: input.campaignId,
      company_id: company.id,
      lead_id: lead.id,
      source: "public_web_search",
      status: "created",
      raw_data: {
        confidence: input.prospect.confidence,
        contact_name: input.prospect.contactName,
        contact_role: input.prospect.contactRole,
        description: input.prospect.description,
        needs_enrichment: isEnrichmentFallback(input.prospect),
        instagram_url: input.prospect.instagramUrl,
        phone: input.prospect.phone,
        source_url: input.prospect.sourceUrl,
        website_url: input.prospect.websiteUrl
      }
    }),
    supabase.from("lead_scores").insert({
      organization_id: input.organizationId,
      lead_id: lead.id,
      score: analysis.score,
      temperature: analysis.temperature,
      fit_score: analysis.fitScore,
      urgency_score: analysis.urgencyScore,
      digital_presence_score: analysis.digitalPresenceScore,
      contactability_score: analysis.contactabilityScore,
      opportunity_score: analysis.opportunityScore,
      reasoning:
        "Score V1 calculado com base em segmento, cidade, presenca digital e dados publicos localizados.",
      generated_by: "ia_sdr_public_search_v1"
    }),
    supabase.from("lead_insights").insert({
      organization_id: input.organizationId,
      lead_id: lead.id,
      possible_pains: analysis.possiblePains,
      opportunities: analysis.opportunities,
      recommended_offer: analysis.recommendedOffer,
      objections: ["Ja tenho agencia", "Quanto custa?", "Me manda uma proposta"],
      buying_signals: ["Empresa localizada em busca publica", "Canal digital encontrado"],
      ai_summary: isEnrichmentFallback(input.prospect)
        ? `Lead criado em contingencia para ${input.prospect.segment} em ${input.prospect.city}. Precisa enriquecer telefone, site e responsavel antes da abordagem.`
        : `Lead encontrado por busca publica para ${input.prospect.segment} em ${input.prospect.city}. Confianca dos dados: ${input.prospect.confidence}%.`
    }),
    supabase.from("generated_messages").insert({
      organization_id: input.organizationId,
      lead_id: lead.id,
      contact_id: contact.id,
      channel: "whatsapp",
      objective: "primeira_abordagem",
      tone: "consultivo",
      message,
      status: "draft",
      generated_by: "ia_sdr_public_search_v1"
    }),
    supabase.from("activities").insert({
      organization_id: input.organizationId,
      company_id: company.id,
      contact_id: contact.id,
      lead_id: lead.id,
      type: isEnrichmentFallback(input.prospect)
        ? "prospect_enrichment_pending"
        : "public_prospect_found",
      title: isEnrichmentFallback(input.prospect)
        ? "Lead pendente de enriquecimento"
        : "Lead encontrado",
      description: isEnrichmentFallback(input.prospect)
        ? `${input.prospect.name} criado em contingencia porque a fonte publica nao respondeu com dados completos.`
        : `${input.prospect.name} localizado via busca publica com confianca ${input.prospect.confidence}%.`
    })
  ]);
}

export async function runProspectingCampaignAction(formData: FormData) {
  await runProspectingCampaign({
    city: formText(formData, "city"),
    quantity: formNumber(formData, "quantity"),
    segment: formText(formData, "segment")
  });
}

export async function runProspectingCampaign(input: {
  city: string;
  quantity: number;
  segment: string;
}) {
  const segment = input.segment.trim();
  const city = input.city.trim();
  const quantity = normalizeQuantity(input.quantity);

  if (!segment || !city || quantity <= 0) {
    throw new Error("Informe segmento, cidade e quantidade.");
  }

  const organization = await getDefaultOrganization();
  const supabase = createSupabaseAdminClient();
  const startedAt = new Date().toISOString();

  const { data: campaign, error: campaignError } = await supabase
    .from("prospecting_campaigns")
    .insert({
      organization_id: organization.id,
      name: `Prospeccao ${segment} em ${city}`,
      segment,
      city,
      requested_quantity: quantity,
      found_quantity: 0,
      status: "processing",
      started_at: startedAt
    })
    .select("id")
    .single();

  if (campaignError) {
    throw new Error(campaignError.message);
  }

  const campaignId = String(campaign.id);

  try {
    const prospects = await searchPublicProspects({ city, quantity, segment });

    for (const prospect of prospects) {
      await createProspectLead({
        campaignId,
        organizationId: organization.id,
        prospect
      });
    }

    await supabase
      .from("prospecting_campaigns")
      .update({
        error_message:
          prospects.length === 0
            ? "Nenhum resultado publico aproveitavel foi encontrado. Tente um segmento mais especifico ou outra cidade."
            : null,
        finished_at: new Date().toISOString(),
        found_quantity: prospects.length,
        status:
          prospects.length === 0 ? "failed" : prospects.length < quantity ? "partial" : "completed"
      })
      .eq("id", campaignId);

    await supabase.from("activities").insert({
      organization_id: organization.id,
      type: "public_prospecting_campaign_finished",
      title: "Campanha de busca publica finalizada",
      description: `${prospects.length} de ${quantity} empresas aproveitaveis encontradas para ${segment} em ${city}.`
    });
  } catch (error) {
    await supabase
      .from("prospecting_campaigns")
      .update({
        error_message: error instanceof Error ? error.message : "Erro desconhecido na busca publica.",
        finished_at: new Date().toISOString(),
        status: "failed"
      })
      .eq("id", campaignId);

    throw error;
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/prospeccao");
  revalidatePath("/empresas");
  revalidatePath("/leads");
  revalidatePath("/mensagens");
}
