"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";
import { buildCommercialAnalysis } from "@/modules/prospecting/services/commercial-analysis";

function formText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formNumber(formData: FormData, key: string): number {
  const value = Number(formText(formData, key));
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(1, Math.min(50, Math.round(value)));
}

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
}

function buildCompanyName(segment: string, city: string, index: number) {
  const cleanSegment = segment || "Empresa";
  const cleanCity = city || "Cidade";
  const prefixes = ["Prime", "Max", "Nova", "Vitta", "Alfa", "Essencial", "Suprema", "Real"];
  return `${cleanSegment} ${prefixes[index % prefixes.length]} ${cleanCity}`.trim();
}

function buildOwnerName(index: number) {
  const names = ["Mariana", "Carlos", "Renata", "Felipe", "Tania", "Bruno", "Camila", "Rafael"];
  return names[index % names.length];
}

function buildPhone(index: number) {
  const suffix = String(928278 + index * 37).padStart(6, "0");
  return `5593920${suffix.slice(-6)}`;
}

export async function runProspectingCampaignAction(formData: FormData) {
  const segment = formText(formData, "segment");
  const city = formText(formData, "city");
  const quantity = formNumber(formData, "quantity");

  if (!segment || !city || quantity <= 0) {
    throw new Error("Informe segmento, cidade e quantidade.");
  }

  const organization = await getDefaultOrganization();
  const supabase = createSupabaseAdminClient();

  const { data: campaign, error: campaignError } = await supabase
    .from("prospecting_campaigns")
    .insert({
      organization_id: organization.id,
      name: `Prospeccao ${segment} em ${city}`,
      segment,
      city,
      requested_quantity: quantity,
      found_quantity: quantity,
      status: "completed",
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (campaignError) {
    throw new Error(campaignError.message);
  }

  for (let index = 0; index < quantity; index += 1) {
    const ownerName = buildOwnerName(index);
    const companyName = buildCompanyName(segment, city, index);
    const phone = buildPhone(index);
    const instagram = `https://instagram.com/${slug(companyName)}`;
    const website = `https://${slug(companyName)}.com.br`;

    const analysis = buildCommercialAnalysis({
      city,
      hasInstagram: true,
      hasPhone: true,
      name: companyName,
      segment
    });

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        organization_id: organization.id,
        name: companyName,
        segment,
        city,
        state: "",
        phone,
        instagram_url: instagram,
        website_url: website,
        source: "prospecting_v1",
        data_confidence: 72
      })
      .select("id")
      .single();

    if (companyError) {
      throw new Error(companyError.message);
    }

    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .insert({
        organization_id: organization.id,
        company_id: company.id,
        name: ownerName,
        role: "Socio ou responsavel comercial",
        phone,
        whatsapp: phone,
        is_primary: true,
        source: "prospecting_v1",
        data_confidence: 68
      })
      .select("id")
      .single();

    if (contactError) {
      throw new Error(contactError.message);
    }

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        organization_id: organization.id,
        company_id: company.id,
        primary_contact_id: contact.id,
        status: "qualified",
        temperature: analysis.temperature,
        origin: "prospeccao_ia_sdr",
        source_campaign_id: campaign.id
      })
      .select("id")
      .single();

    if (leadError) {
      throw new Error(leadError.message);
    }

    const message = `Oi ${ownerName}, tudo bem? Vi a ${companyName} em ${city} e percebi uma oportunidade de melhorar a captacao de clientes pelo digital.

Sou da MD Marketing Empresarial. A gente ajuda empresas a transformar presenca digital em demanda e vendas, unindo conteudo, trafego e processo comercial.

Faz sentido eu te mostrar uma ideia rapida para aumentar os contatos qualificados da ${companyName}?`;

    await Promise.all([
      supabase.from("prospecting_results").insert({
        organization_id: organization.id,
        campaign_id: campaign.id,
        company_id: company.id,
        lead_id: lead.id,
        source: "mock_v1",
        status: "created",
        raw_data: {
          decision_maker_priority: "owner_first",
          instagram,
          owner_name: ownerName,
          phone,
          website
        }
      }),
      supabase.from("lead_scores").insert({
        organization_id: organization.id,
        lead_id: lead.id,
        score: analysis.score,
        temperature: analysis.temperature,
        fit_score: analysis.fitScore,
        urgency_score: analysis.urgencyScore,
        digital_presence_score: analysis.digitalPresenceScore,
        contactability_score: analysis.contactabilityScore,
        opportunity_score: analysis.opportunityScore,
        reasoning:
          "Score V1 calculado por segmento, presenca digital, contato localizado e potencial de captacao comercial.",
        generated_by: "ia_sdr_v1"
      }),
      supabase.from("lead_insights").insert({
        organization_id: organization.id,
        lead_id: lead.id,
        possible_pains: analysis.possiblePains,
        opportunities: analysis.opportunities,
        recommended_offer: analysis.recommendedOffer,
        objections: ["Ja tenho agencia", "Quanto custa?", "Me manda uma proposta"],
        buying_signals: ["Busca por mais clientes", "Responsavel identificado", "Canal digital encontrado"],
        ai_summary: `Lead de ${segment} em ${city}, com contato decisor priorizado e boa oportunidade para conversa consultiva.`
      }),
      supabase.from("generated_messages").insert({
        organization_id: organization.id,
        lead_id: lead.id,
        contact_id: contact.id,
        channel: "whatsapp",
        objective: "primeira_abordagem",
        tone: "consultivo",
        message,
        status: "draft",
        generated_by: "ia_sdr_v1"
      }),
      supabase.from("activities").insert({
        organization_id: organization.id,
        company_id: company.id,
        contact_id: contact.id,
        lead_id: lead.id,
        type: "prospecting_lead_generated",
        title: "Lead prospectado pela IA SDR",
        description: `Lead ${companyName} criado com score ${analysis.score}.`
      })
    ]);
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/prospeccao");
  revalidatePath("/empresas");
  revalidatePath("/leads");
  revalidatePath("/mensagens");
}
